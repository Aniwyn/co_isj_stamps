import { useState, useRef } from "react"
import { Card, CardHeader, CardBody, Input, Button, Typography, Select, Option } from "@material-tailwind/react"
import { useReactToPrint } from "react-to-print"
import { UserIcon, DocumentIcon } from "@heroicons/react/24/outline"
import { format } from "date-fns"
import DataPicker from "./components/DataPicker.jsx"
import PdfPreview from "./components/pdfPreview.jsx"
import fetchPdf from "./utils/pdfFetch.js"


export default function App() {
    const [diagnostic, setDiagnostic] = useState("")
    const [url, setUrl] = useState("")
    const [date, setDate] = useState(new Date())
    const [medic, setMedic] = useState({})
    const [pdfData, setPdfData] = useState(null)
    const contentRef = useRef(null)

    const STAMPS = [
        {
            ID: "ASE",
            name: "Dra. Veronica Ase",
            prof: "Médica cirujana",
            esp: "Esp. Oftalmología",
            mp: "M.P. 3831",
            mp_to_find: "3831"
        },
        {
            ID: "ALCOBA",
            name: "Dr. Emilio E. Alcoba",
            prof: "Médico Especialista",
            esp: "En Oftalmología",
            mp: "M.P. 3971 - M.N. 153821",
            mp_to_find: "3971"
        },
        {
            ID: "SIUFIE",
            name: "Dr. Ernesto Siufi",
            prof: "Médico cirujano",
            esp: "Esp. Oftalmología",
            mp: "M.P. 1398",
            mp_to_find: "1398"
        },
        {
            ID: "SIUFIL",
            name: "Dr. Lucas Siufi",
            prof: "Médico cirujano",
            esp: "Esp. Oftalmología",
            mp: "M.P. 3280",
            mp_to_find: "3280"
        },
        {
            ID: "ZARIFJ",
            name: "Dr. Jose Luis Zarif",
            prof: "Médico cirujano",
            esp: "Esp. Oftalmología",
            mp: "M.P. 2010",
            mp_to_find: "2010"
        },
        {
            ID: "ZARIFA",
            name: "Dra. Agustina A. Zarif",
            prof: "Médica cirujana",
            esp: "Esp. Oftalmología",
            mp: "M.P. 4035",
            mp_to_find: "4035"
        },
        {
            ID: "MAITE",
            name: "Dra. Maite Dipierri",
            prof: "Médica cirujana",
            esp: "Esp. Oftalmología",
            mp: "M.P. 4124",
            mp_to_find: "4124"
        },
        {
            ID: "TONELLI",
            name: "Dra. Tonelli Mariela S.",
            prof: "Médica cirujana",
            esp: "Esp. Oftalmología",
            mp: "M.P. 3328",
            mp_to_find: "3328"
        },
        {
            ID: "ABUD",
            name: "Dra. Valeria S. Abud",
            prof: "Médica",
            esp: "M.P. 4156",
            mp: "",
            mp_to_find: "4156"
        },
        {
            ID: "JURE",
            name: "Dr. Fancisco J. Jure",
            prof: "Médico cirujano",
            esp: "Esp. Oftalmología",
            mp: "M.P. 2883",
            mp_to_find: "2883"
        },
    ]

    const handleUrl = (e) => setUrl(e.target.value)
    const handleDiagnostic = (e) => { setDiagnostic(e.target.value) }
    const handleMedic = (e) => {
        const selectedMedic = STAMPS.find((stamp) => stamp.name === e)
        if (selectedMedic) {
            setMedic(selectedMedic)
        }
    }

    const handleFetch = () => {
        const fecthAsyncPDF = async () => {
            const { modifiedPdf, text } = await fetchPdf(url)
            setPdfData(modifiedPdf)

            const foundStamp = STAMPS.find(stamp => new RegExp(`\\n${stamp.mp_to_find}\\n`).test(text))
            if (foundStamp) {
                setMedic(foundStamp)
                console.log("Médico encontrado:", foundStamp.name)
            }
        }

        fecthAsyncPDF()
    }

    const handlePrint = useReactToPrint({ contentRef })

    return (
        <Card className="h-screen w-screen flex flex-row box-content">
            <div className="flex justify-center items-center w-1/2" id="preview-content">
                <div className="relative print-content" ref={contentRef} id="preview">
                    <>
                    <p className="absolute top-[378px] left-[220px] w-[120px] text-center text-sm z-[99] text-xs">{(date && pdfData) ? format(date, "dd / MM / yyyy") : ""}</p>
                    <p className="absolute top-[423px] left-[75px] w-[100px] text-center text-sm z-[99] text-xs">{(diagnostic && pdfData) ? diagnostic : ""}</p>
                    <div>
                        <p className="absolute text-[0.8rem] top-[435px] left-[50px] w-[150px] text-center z-[99] text-sm">{(medic.name && pdfData) ? medic.name : ""}</p>
                        <p className="absolute text-[0.6rem] top-[448px] left-[50px] w-[150px] text-center z-[99] text-xs">{(medic.prof && pdfData) ? medic.prof : ""}</p>
                        <p className="absolute text-[0.6rem] top-[457px] left-[50px] w-[150px] text-center z-[99] text-xs">{(medic.esp && pdfData) ? medic.esp : ""}</p>
                        <p className="absolute text-[0.6rem] top-[466px] left-[50px] w-[150px] text-center z-[99] text-xs">{(medic.mp && pdfData) ? medic.mp : ""}</p>
                    </div>
                    </>
                    <div className="relative">
                        {pdfData && <PdfPreview file={pdfData} />}
                    </div>
                </div>
            </div>
            <div className="w-1/2 m-6">
                <Card>
                    <CardHeader
                        color="gray"
                        floated={false}
                        shadow={false}
                        className="m-0 grid place-items-center px-4 py-4 text-center"
                    >
                        <Typography variant="h3" color="white">
                            ISJ
                        </Typography>
                    </CardHeader>
                    <CardBody>
                        <form className="flex flex-col gap-2">
                            <div className="flex flex-row mt-4">
                                <Input
                                    label="URL"
                                    placeholder="http://genos.isj.gov.ar/emision/apraorda5.aspx?12345..."
                                    variant="static"
                                    value={url}
                                    onChange={handleUrl}
                                    className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                                    icon={<UserIcon className="h-4 w-4 text-gray-500" />}
                                />
                                <Button className="ms-4" onClick={handleFetch}>Buscar</Button>
                            </div>
                            <div className="mt-2 flex flex-row gap-4">
                                <div>
                                    <Input
                                        label="Diagnostico"
                                        placeholder="H53"
                                        variant="static"
                                        value={diagnostic}
                                        onChange={handleDiagnostic}
                                        className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                                        icon={<DocumentIcon className="h-4 w-4 text-gray-500" />}
                                    />
                                </div>
                                <div>
                                    <Select
                                        variant="static"
                                        label="Médico"
                                        placeholder="Dr. Jose Luis Zarif"
                                        onChange={handleMedic}
                                    >
                                        {STAMPS.map((stamp) => (
                                            <Option key={stamp.ID} value={stamp.name}>
                                                {stamp.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                                <div>
                                    <DataPicker date={date} setDate={setDate} />
                                </div>
                            </div>
                            <Button className="mt-5" size="lg" onClick={handlePrint}>
                                Imprimir receta
                            </Button>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </Card>
    )
}