export const exportToCSV = (rows: Record<string, unknown>[], filename: string) => {
  if (!rows || rows.length === 0) {
    return
  }

  // Extract headers
  const headers = Object.keys(rows[0])

  // Convert rows to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(header => {
        const cell = row[header] === null || row[header] === undefined ? '' : String(row[header])
        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
          return `"${cell.replace(/"/g, '""')}"`
        }
        return cell
      }).join(',')
    )
  ].join('\n')

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
