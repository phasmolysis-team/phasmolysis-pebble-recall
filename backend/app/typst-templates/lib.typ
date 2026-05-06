#let table_gen(src, title) = {
  let csvdata = csv(src)
  let filtered_data = csvdata.map(row => row.slice(1))
  let col_count = filtered_data.first().len()


  heading(title, level: 2)
  
  table(
    columns: (auto,) * col_count,
    ..filtered_data.flatten(),
  )
}
