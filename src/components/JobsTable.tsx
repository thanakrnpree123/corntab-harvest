import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CronJob } from "@/lib/types"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog"
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

interface JobsTableProps {
  jobs: CronJob[]
  onEdit: (job: CronJob) => void
  onDelete: (job: CronJob) => void
  onDuplicate: (job: CronJob) => void
}

export function JobsTable({ jobs, onEdit, onDelete, onDuplicate }: JobsTableProps) {
  const { toast } = useToast()
  const [jobToDelete, setJobToDelete] = useState<CronJob | null>(null)
  const [open, setOpen] = useState(false)

  const columns: ColumnDef<CronJob>[] = [
    {
      accessorKey: "name",
      header: "ชื่องาน",
    },
    {
      accessorKey: "schedule",
      header: "ตารางเวลา",
    },
    {
      accessorKey: "endpoint",
      header: "ปลายทาง",
    },
    {
      accessorKey: "lastRun",
      header: "ทำงานล่าสุด",
      cell: ({ row }) => {
        const lastRun = row.original.lastRun
        return lastRun ? dayjs(lastRun).fromNow() : "ไม่เคยรัน"
      },
    },
    {
      accessorKey: "status",
      header: "สถานะ",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const job = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onDuplicate(job)}>
                <Copy className="mr-2 h-4 w-4" />
                คัดลอก
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(job)}>
                <Edit className="mr-2 h-4 w-4" />
                แก้ไข
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setJobToDelete(job)
                  setOpen(true)
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                ลบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of {jobs.length} row(s)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      <ConfirmDeleteDialog
        open={open}
        setOpen={setOpen}
        onConfirm={() => {
          if (jobToDelete) {
            onDelete(jobToDelete)
            toast({
              title: "ลบงานสำเร็จ",
              description: `งาน "${jobToDelete.name}" ถูกลบแล้ว`,
            })
            setJobToDelete(null)
          }
        }}
      />
    </>
  )
}
