'use client'

import type React from 'react'
import { Card, Table } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'

export type Column<T> = {
  key: string
  label: string
  format?: 'boolean' | 'dateTime' | 'fileSizeKb'
}

type Props<T> = {
  title: string
  subTitle?: string
  rows: T[]
  columns: Column<T>[]
}

const formatCellValue = (value: unknown, format?: Column<unknown>['format']): React.ReactNode => {
  if (value === null || value === undefined || value === '') return '-'

  if (format === 'boolean') return value ? 'Yes' : 'No'
  if (format === 'fileSizeKb') return `${value} KB`
  if (format === 'dateTime') return new Date(String(value)).toLocaleString()

  return String(value)
}

const TablePage = <T,>({ title, subTitle, rows, columns }: Props<T>) => {
  return (
    <>
      <PageTitle title={title} subTitle={subTitle} />

      <Card className="mt-3">
        <Card.Body>
          <div className="text-muted fs-13 mb-2">Total: {rows.length}</div>
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((r, idx) => (
                    <tr key={idx}>
                      {columns.map((c) => (
                        <td key={c.key}>{formatCellValue((r as Record<string, unknown>)?.[c.key], c.format)}</td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-4">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </>
  )
}

export default TablePage
