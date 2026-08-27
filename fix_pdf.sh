sed -i 's/const unitLabel = item.unit === '"'carton'"' ? '"'کارتن'"' : item.unit === '"'box'"' ? '"'باکس'"' : '"'پاکت'"';/const unitLabel = item.unit === '"'carton'"' ? '"'کارتن'"' : item.unit === '"'box'"' ? '"'باکس'"' : item.unit === '"'pack'"' ? '"'پاکت'"' : item.unit === '"'item'"' ? '"'عدد'"' : '"'واحد'"';/g' src/utils/pdfGenerator.ts

sed -i 's/padding: 4px 2px;/padding: 7px 4px;/g' src/utils/pdfGenerator.ts
