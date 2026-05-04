from fastapi import APIRouter, Response, Request
from fastapi.responses import FileResponse
from tempfile import NamedTemporaryFile
import typst

router = APIRouter()

@router.get(path="/export", response_class=FileResponse)
async def give_me_pdf(request: Request, response: Response):
    files = {
        "main.typ": b'#import "lib.typ": greet\n= Hello\n#greet("World")',
        "lib.typ": b'#let greet(name) = [Hello, #name!]',
    }


    with NamedTemporaryFile(delete_on_close=True) as fp:
        typst.compile(files, format="pdf", output=fp.name)  # ty: ignore
        out = fp.read()
        headers = {'Content-Disposition': 'inline; filename="out.pdf"'}
        return Response(out, headers=headers, media_type='application/pdf')
