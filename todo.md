# Givethra Missing Case Attachments Deep Debug TODO

- [x] Inspect case submission router (`server/routers/givethra.ts`) to see how multi-step case forms store uploaded files into DB / caseFiles table
- [x] Check frontend submit case page (`client/src/pages/SubmitCasePage.tsx` or equivalent) to verify if additional files are actually sent to the backend or only held in local state
- [x] Inspect Admin Panel case detail component (`AdminDashboard` / `GivethraPages.tsx`) to verify how `record.files` is iterated and rendered
- [x] Trace end-to-end data flow from submit step 1-4 to ensure supporting documents are persisted and fetched properly
