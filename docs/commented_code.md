
# Code Refactoring Documentation

## Background
This document contains commented code sections that were refactored from the original codebase. The purpose of this refactoring was to improve code organization, reduce file size, and increase maintainability.

## JobsTable.tsx (Original 339 lines)
The original `JobsTable.tsx` file was split into three separate components:
- `JobsTable.tsx` (main component)
- `JobsActions.tsx` (handles action buttons and dropdown menu)
- `JobRowDisplay.tsx` (handles individual job row rendering)

### Commented Code Sections

#### JobsTable Batch Actions Section
```jsx
{/* <div className="mb-4">
  <ProjectBatchActions
    projects={projects}
    selectedProjectIds={selectedProjectIds}
    onExport={handleBatchExport}
    onDelete={handleBatchDelete}
    disabled={projects.length === 0}
  />
</div> */}
```

#### Job Details Actions
```jsx
{/* <TableCell
  className="text-right"
  onClick={(e) => e.stopPropagation()}
>
  <div className="relative">
    <button
      onClick={(e) => {
        e.stopPropagation();
        setOpenDropdownId((prev) =>
          prev === job.id
            ? null
            : job.id,
        );
      }}
      className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
    >
      <EllipsisVertical
        color="#000000"
        strokeWidth={0.75}
      />
    </button>

    {openDropdownId === job.id && (
      <div className="absolute right-0 top-10 bg-white border rounded-md shadow-lg z-[9999] transform translate-y-2">
        <div className="py-1 w-32">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditJob(job);
              setOpenDropdownId(null);
            }}
            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
          >
            Edit
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdownId(
                    null,
                  );
                }}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
              >
                Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ลบงาน
                </AlertDialogTitle>
                <AlertDialogDescription>
                  คุณต้องการลบงาน "
                  {job.name}"
                  ใช่หรือไม่?
                  การกระทำนี้ไม่สามารถยกเลิกได้
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  ยกเลิก
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    handleDeleteJob(job)
                  }
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  ลบงาน
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    )}
  </div>
</TableCell> */}
```

## ProjectsTable.tsx (Original 594 lines)
The original `ProjectsTable.tsx` file was split into three separate components:
- `ProjectsTable.tsx` (main component)
- `ProjectRow.tsx` (handles individual project row rendering)
- `ProjectJobsList.tsx` (handles the list of jobs for each project)

### Commented Code Sections

#### ProjectBatchActions
```jsx
{/* <div className="mb-4">
  <ProjectBatchActions
    projects={projects}
    selectedProjectIds={selectedProjectIds}
    onExport={handleBatchExport}
    onDelete={handleBatchDelete}
    disabled={projects.length === 0}
  />
</div> */}
```

## Refactoring Benefits

1. **Improved Code Organization**: Each component now has a single responsibility
2. **Better Maintainability**: Smaller files are easier to understand and modify
3. **Enhanced Reusability**: Components can now be used in multiple contexts
4. **Reduced Complexity**: Splitting complex components makes the code easier to debug
5. **Better Performance**: Smaller components may lead to better React rendering performance

## Next Refactoring Candidates

- **JobDetails.tsx**: Consider splitting into smaller components if complex
- **RecentJobsList.tsx**: Could be refactored to improve code organization
- **BatchJobsActions.tsx**: Potential candidate for further componentization
