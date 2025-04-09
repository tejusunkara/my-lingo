import { cache } from "react";
import db from "./drizzle";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { courses, userProgress, units, } from "./schema";

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

  if(!userProgress?.activeCourseId) {
    return null;
  }

  // TODO: update to use Drizzle SQL query builder
  const data = await db.query.units.findMany({
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        with: {
          challenges: {
            with: {
              challengeProgress: true,
            },
          }
        },
      },
    },
  });

  const normalizedData = data.map((unit) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
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
})
