import { FC, useState } from "react"
import Switch from "react-switch"
import { ROUTES_CONFIG } from "@/constants"
import { useLocation } from "react-router"
import styled, { useTheme } from "styled-components"
import { ThemeName, useTheme as useThemeName } from "@/theme"

export enum InstrumentType {
  FX = "FX",
  CREDIT = "Credit",
}

const Label = styled.span`
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  font-size: 0.75rem;
`

interface Props {
  handleInstrumentTypeSelection: (instrumentType: InstrumentType) => void
}
export const InstrumentTypeSwitch: FC<Props> = ({
  handleInstrumentTypeSelection,
}) => {
  const theme = useTheme()
  const { themeName } = useThemeName()
  const location = useLocation()
  let [isCreditSelected, setCreditSelected] = useState(
    location.pathname === ROUTES_CONFIG.credit,
  )

  const mainColor =
    themeName === ThemeName.Light ? theme.primary.base : theme.primary[1]
  const handleColor = theme.accents.primary.base
  return (
    <>
      <Label>{InstrumentType.FX}</Label>
      <Switch
        checked={isCreditSelected}
        onChange={(isChecked) => {
          setCreditSelected(isChecked)
          handleInstrumentTypeSelection(
            isChecked ? InstrumentType.CREDIT : InstrumentType.FX,
          )
        }}
        handleDiameter={15}
        onColor={mainColor}
        offColor={mainColor}
        onHandleColor={handleColor}
        offHandleColor={handleColor}
        checkedIcon={false}
        uncheckedIcon={false}
      />
      <Label>{InstrumentType.CREDIT}</Label>
    </>
  )
}

export default InstrumentTypeSwitch
