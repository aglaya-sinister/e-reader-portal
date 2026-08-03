This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Reviews

Readers write their own reviews on the homepage. Everything posted is filed
under a key named for the current date in `America/Chicago`, and only that key
is ever read, so the board is empty again at 12:00 AM. Change the timezone in
`lib/reviews.ts` (`REVIEW_TIMEZONE`) to move midnight.

Locally the board falls back to a JSON file in `node_modules/.cache`, so
`npm run dev` works with no setup. A deployed build needs a Redis store — on
Vercel, add **Upstash Redis** from the Storage tab and connect it to the
project. That sets the variables the board looks for:

```
KV_REST_API_URL          # or UPSTASH_REDIS_REST_URL
KV_REST_API_TOKEN        # or UPSTASH_REDIS_REST_TOKEN
```

Until they are set, a deployed board reads as empty and posting says reviews
are not switched on. Nothing else on the site is affected.

Anyone can post — there is no sign-in and no moderation queue. The daily wipe
is the main limit; on top of it, one address may post 10 reviews an hour and
the board holds 200 a day.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
