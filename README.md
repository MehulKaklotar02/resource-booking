# Resource Booking System

Resource booking system create using React, Redux Toolkit, Materail UI, Node.js, Express, PostgreSQL, Prisma.
---

## How to run

### 1. Backend Setup
```bash
cd backend
yarn install ## or delete yarn.lock and then run npm install (if use npm package manager then run below command with nom not yarn)
yarn db:migrate ## Reflect changes to database
yarn db:seed ## add some default data into database
yarn dev ## run backend server
```

### 2. Frontend Setup
```bash
cd frontend
yarn install ## or delete yarn.lock and then run npm install (if use npm package manager then run below command with nom not yarn)
yarn dev
```

### 3. Run Automate Test
```bash
cd backend
yarn test
```

---

## How handled double booking in resource booking

If 2 user book slot at same time for same resource then how to mannage that functonality. For that in database level add rule:

```sql
ALTER TABLE "Booking"
ADD CONSTRAINT "no_overlapping_bookings"
EXCLUDE USING gist (
    "resourceId" WITH =,
    tsrange("startTime", "endTime", '[)') WITH &&
);
```

This query is worked based on following condition :
- It will check for same resourceId.
- It will check for overlapping time range. This `[)` means start time is inclusive and end time is exclusive and it's check mathematically that time is not overlapped.

## How handled timezone & day light saving (DST)
- Storing all date time in `Universal Time Coordinated (UTC)` format in database.
- All resource availability stores in its `timezone` (e.g. `Asia/Kolkata`, `America/New_York`, `Europe/London`).
- When availability save or retrieved from database then convert local time to UTC and UTC to local time.
- User can view slots formatted based on selected their own `timezone` (e.g. `Asia/Kolkata`, `America/New_York`, `Europe/London`).

## Slots longth
- All booking slots length is 1hr.
