#import "lib.typ": table_gen
#import sys: inputs
#set page(flipped: true)
#heading(inputs.whom, level: 1)

#let csvfiles = json(bytes(sys.inputs.csvfiles))

#for csvfile in csvfiles [
   #table_gen(csvfile.filepath, csvfile.title) \
]

