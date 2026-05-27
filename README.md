# My Lingo
A language-learning SaaS tying together AI, payment capabilities, and more.

<!-- This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). -->

This app was built using:
* Next.js 14
* Drizzle ORM
* PostgreSQL
* Server Actions
* Stripe
* ShadcnUI
* Tailwind and more


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Notes
* Routes need a `page.tsx` file inside the folder to render the content
### Features

A language learning Software as a Service (SaaS) similar to Duolingo.
* Built with Typescript
* Using `shadcn/ui` to create a custom reusable component library


## Trade-off Analysis

### State Management: Zustand vs Redux

This project uses **Zustand** for global client state (e.g. modal open/close). Both Zustand and Redux solve the same problem — sharing state across components without prop drilling — but differ in how much structure they impose.

| | Redux | Zustand |
|---|---|---|
| Boilerplate | High — actions, reducers, selectors, dispatch | Minimal — one `create()` call |
| Pattern | Strict: state updated only via dispatched actions | Flexible: call `set()` directly |
| DevTools | Excellent — time-travel debugging, full action log | Basic DevTools support |
| Bundle size | Larger (even with Redux Toolkit) | ~1kb |
| Best for | Large teams, complex state, auditability | Small-to-medium apps, simple shared state |

Redux's strictness pays off on large teams where every state change needs a named action and a full audit trail. For a smaller app like this one, that ceremony adds friction without benefit. Zustand's low barrier to use makes it the better fit here — a store for a modal toggle is a single file with three properties.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
