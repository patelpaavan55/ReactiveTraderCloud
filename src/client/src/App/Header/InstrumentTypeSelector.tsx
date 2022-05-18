import { FC } from "react"
import { DropdownMenu } from "@/components/DropdownMenu"
import { ROUTES_CONFIG } from "@/constants"
import { useLocation } from "react-router"

export enum InstrumentType {
  FX = "FX",
  CREDIT = "Credit",
}

interface Props {
  handleInstrumentTypeSelection: (instrumentType: InstrumentType) => void
}
const InstrumentTypeSelector: FC<Props> = ({
  handleInstrumentTypeSelection,
}) => {
  const location = useLocation()

  return (
    <DropdownMenu
      options={[InstrumentType.FX, InstrumentType.CREDIT]}
      onSelectionChange={(selection) => {
        handleInstrumentTypeSelection(selection as InstrumentType)
      }}
      selection={
        location.pathname === ROUTES_CONFIG.credit
          ? InstrumentType.CREDIT
          : InstrumentType.FX
      }
    />
  )
}

export default InstrumentTypeSelector
