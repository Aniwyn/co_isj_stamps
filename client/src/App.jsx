import { useEffect, useState, useRef } from "react"
import { Alert, Card, CardHeader, CardBody, Input, Button, Typography, Select, Option } from "@material-tailwind/react"
import { useReactToPrint } from "react-to-print"
import { UserIcon, DocumentIcon } from "@heroicons/react/24/outline"
import { format } from "date-fns"
import DataPicker from "./components/DataPicker.jsx"
import PdfPreview from "./components/PdfPreview.jsx"
import fetchPdf from "./utils/pdfFetch.js"


export default function App() {
    const [diagnostic, setDiagnostic] = useState("H531")
    const [url, setUrl] = useState("")
    const [date, setDate] = useState(new Date())
    const [medic, setMedic] = useState({})
    const [pdfData, setPdfData] = useState(null)
    const [warningState, setWarningState] = useState(false)
    const [alertMessage, setAlertMessage] = useState("")
    const contentRef = useRef(null)

    const STAMPS = [
        {
            ID: "ASE",
            name: "Dra. Veronica Ase",
            prof: "Médica cirujana",
            esp: "Esp. Oftalmología",
            mp: "M.P. 3831",
            mp_to_find: "3831",
            name_to_compare: "ASE ANDREA VERONICA" //check
        },
        {
            ID: "ALCOBA",
            name: "Dr. Emilio E. Alcoba",
            prof: "Médico Especialista",
            esp: "En Oftalmología",
            mp: "M.P. 3971 - M.N. 153821",
            mp_to_find: "3971",
            name_to_compare: "ALCOBA EMILIO"
        },
        {
            ID: "SIUFIE",
            name: "Dr. Ernesto Siufi",
            prof: "Médico cirujano",
            esp: "Esp. Oftalmología",
            mp: "M.P. 1398",
            mp_to_find: "1398",
            name_to_compare: "SIUFI ERNESTO" //check
        },
        {
            ID: "SIUFIL",
            name: "Dr. Lucas Siufi",
            prof: "Médico cirujano",
            esp: "Esp. Oftalmología",
            mp: "M.P. 3280",
            mp_to_find: "3280",
            name_to_compare: "SIUFI LUCAS" //check
        },
        {
            ID: "ZARIFJ",
            name: "Dr. Jose Luis Zarif",
            prof: "Médico cirujano",
            esp: "Esp. Oftalmología",
            mp: "M.P. 2010",
            mp_to_find: "2010",
            name_to_compare: "ZARIF JOSE LUIS" //check
        },
        {
            ID: "ZARIFA",
            name: "Dra. Agustina A. Zarif",
            prof: "Médica cirujana",
            esp: "Esp. Oftalmología",
            mp: "M.P. 4035",
            mp_to_find: "4035",
            name_to_compare: "ZARIF AGUSTINA"
        },
        {
            ID: "MAITE",
            name: "Dra. Maite Dipierri",
            prof: "Médica cirujana",
            esp: "Esp. Oftalmología",
            mp: "M.P. 4124",
            mp_to_find: "4124",
            name_to_compare: "DIPIERRI MAITE"
        },
        {
            ID: "TONELLI",
            name: "Dra. Tonelli Mariela S.",
            prof: "Médica cirujana",
            esp: "Esp. Oftalmología",
            mp: "M.P. 3328",
            mp_to_find: "3328",
            name_to_compare: "TONELLI MARIELA"
        },
        {
            ID: "ABUD",
            name: "Dra. Valeria S. Abud",
            prof: "Médica",
            esp: "M.P. 4156",
            mp: "",
            mp_to_find: "4156",
            name_to_compare: "ABUD VALERIA SOLEDAD" //check
        },
        {
            ID: "JURE",
            name: "Dr. Fancisco J. Jure",
            prof: "Médico cirujano",
            esp: "Esp. Oftalmología",
            mp: "M.P. 2883",
            mp_to_find: "2883",
            name_to_compare: "JURE FRANCISCO JOSE" //check
        }
    ]

    useEffect(() => {
        const getUrl = async () => {
            const params = new URLSearchParams(window.location.search)
            const genosurl = params.get("genosurl")
            if (genosurl) {
                console.log("URL capturada desde la extension: ", genosurl)
                await setUrl(genosurl)
                await handleFetch(genosurl)
            }
        }

        getUrl()
    }, [])

    const handleUrl = (e) => setUrl(e.target.value)
    const handleDiagnostic = (e) => { setDiagnostic(e.target.value) }
    const handleMedic = (e) => {
        const selectedMedic = STAMPS.find((stamp) => stamp.name === e)
        if (selectedMedic) {
            setMedic(selectedMedic)
        }
    }

    const handleFetch = (urlParam) => {
        const fecthAsyncPDF = async () => {
            const urlToFetch = url || urlParam
            const { modifiedPdf, text } = await fetchPdf(urlToFetch)
            setPdfData(modifiedPdf)
            console.log(text)

            //onst foundStamp = STAMPS.find(stamp => new RegExp(`\\n${stamp.mp_to_find}\\n`).test(text)) QUEDO OBSOLETO
            const foundStamp = STAMPS.find(stamp => new RegExp(`MD\\s*-\\s*${stamp.mp_to_find}\\s*-`).test(text))
            if (foundStamp) {
                setMedic(foundStamp)
                console.log("Médico encontrado (por matrícula):", foundStamp.name_to_compare)

                const nameLineMatch = text.match(/Centro Atenc\.:\s*\n([A-ZÁÉÍÓÚÑ\s]+)\nCLINICA DE OJOS/)
                if (nameLineMatch) {
                    const medicName = nameLineMatch[1].trim()
                    console.log("Médico en línea de abajo: ", medicName, "\nMédico (sello) encontrado: ", foundStamp.name_to_compare)

                    if (medicName.toUpperCase() !== foundStamp.name_to_compare.toUpperCase()) {
                        setAlertMessage("Advertencia: el médico ")
                        setWarningState(true)
                    } else {
                        setWarningState(false)
                    }
                } else {
                    setAlertMessage("Advertencia: No se encontro segunda Linea")
                    setWarningState(false) // Preguntar si es una alerta esto
                }
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
                            {
                                warningState ?
                                    <div className="pt-5">
                                        <Alert color="amber">{alertMessage}</Alert>
                                    </div>
                                    :
                                    <></>
                            }
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