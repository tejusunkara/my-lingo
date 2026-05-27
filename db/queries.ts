import { cache } from "react";
import db from "./drizzle";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import {
  courses,
  userProgress,
  units,
  challengeProgress,
  lessons,
  challenges,
} from "./schema";

export const getUserProgress = cache(async () => {
  const { userId } = await auth();

  if(!userId) {
    return null;
  }

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {

      activeCourse: true,
    },
  });

  return data;
});

export const getUnits = cache(async () => {
  const userProgress = await getUserProgress();
  const { userId} = await auth();

  if(!userId || !userProgress?.activeCourseId) {
    return [];
  }

  // TODO: update to use Drizzle SQL query builder
  // TODO: add ordering
  const data = await db.query.units.findMany({
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          }
        },
      },
    },
  });

  const normalizedData = data.map((unit) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
      if (lesson.challenges.length === 0) {
        return { ...lesson, completed: false };
      }
      const allChallengesCompleted = lesson.challenges.every(
        (challenge) => {
          return challenge.challengeProgress
            && challenge.challengeProgress.length > 0
            && challenge.challengeProgress.every((progress) => progress.completed)
        });

      return {
        ...lesson,
        completed: allChallengesCompleted,
      };
    });

    return {
      ...unit,
      lessons: lessonsWithCompletedStatus,
    };
  });

  // const normalizedData = data.map((unit) => {
  //   const unitLessons = data.filter((row) => row.lessons?.unitId === unit.id);
    
  //   const lessons = unitLessons.map((row) => {
  //     if (!row.lessons) return null;

  //     const lessonChallenges = data.filter(
  //       r => r.challenges?.lessonId === row.lessons.id
  //     );

  //     const isCompleted = lessonChallenges.length > 0 && 
  //       lessonChallenges.every(r => r.challengeProgress?.completed);

  //     return {
  //       ...row.lessons,
  //       completed: isCompleted,
  //     };
  //   }).filter((l): l is NonNullable<typeof l> => l !== null);

  //   const isUnitCompleted = lessons.length > 0 && 
  //     lessons.every(lesson => lesson.completed);

  //   return {
  //     ...unit,
  //     completed: isUnitCompleted,
  //     lessons,
  //     unitLessons,
  //   };
  // });

  return normalizedData;
});

export const getCourses = cache(async () => { // will cache response for any calls made in any other component
  const data = await db.query.courses.findMany();
  return data;
});

export const getCourseById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    // TODO: populate units and lessons
  });

  return data;
});

export const getCourseProgress = cache(async () => {
  const { userId } = await auth();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress || !userProgress.activeCourseId) {
    return null;
  }

  const unitsInActiveCourse = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgress?.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          unit: true,
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
      return lesson.challenges.some((challenge) => {
        return !challenge.challengeProgress
          || challenge.challengeProgress.length === 0
          || challenge.challengeProgress.some((progress) => progress.completed === false);
      });
    });

    return {
      activeLesson: firstUncompletedLesson,
      activeLessonId: firstUncompletedLesson?.id
    }
});

export const getLesson = cache(async (id?: number) => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }
  const courseProgress = await getCourseProgress();

  if (!courseProgress) {
    return null;
  }

  const lessonId = id || courseProgress.activeLessonId;

  if (!lessonId) {
    return null;
  }

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        with: {
          challengeOptions: true,
          challengeProgress: {
            where: eq(challengeProgress.userId, userId),
          },
        },
      },
    },
  });

  if (!data || !data.challenges) {
    return null;
  }

  const normalizedChallenges = data.challenges.map((challenge) => {
    const completed = challenge.challengeProgress
      && challenge.challengeProgress.length > 0
      && challenge.challengeProgress.every((progress) => progress.completed);

    return { ...challenge, completed };
  });

  return { ...data, challenges: normalizedChallenges };
});

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();

  if (!courseProgress?.activeLessonId) {
    return 0;
  }

  const lesson = await getLesson(courseProgress.activeLessonId);

  if (!lesson) {
    return 0;
  }

  const completedChallenges = lesson.challenges.filter((challenge) => challenge.completed);
  const percentage = Math.round((completedChallenges.length / lesson.challenges.length) * 100);

  return percentage;
})
