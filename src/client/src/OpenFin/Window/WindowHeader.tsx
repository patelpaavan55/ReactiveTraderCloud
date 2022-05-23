import Header from "@/App/Header"
import ThemeSwitcher from "@/App/Header/theme-switcher"
import InstrumentTypeSwitch, {
  InstrumentType,
} from "@/App/Header/InstrumentTypeSwitch"
import { LayoutLock } from "./LayoutLock"
import { Props as WindowControlProps, WindowControls } from "./WindowControls"
import { TitleBar } from "./WindowHeader.styles"
import LoginControls from "@/App/Header/LoginControls"
import { creditSnapshot } from "@/OpenFin/utils/creditSnapshot"
import { useLocalStorage } from "@/utils"
import { Platform } from "openfin/_v2/api/platform/platform"
import { IS_CREDIT_ENABLED } from "@/constants"

const useOpenFinInstrumentTypeSelectionHandler = () => {
  const OPENFIN_LAST_FX_SNAPSHOT = "OPENFIN_LAST_FX_SNAPSHOT"
  const [lastFxSnapshot, setLastFxSnapshot] = useLocalStorage(
    OPENFIN_LAST_FX_SNAPSHOT,
    null,
  )

  const storeCurrentFxLayout = async (platform: Platform) =>
    setLastFxSnapshot(await platform.getSnapshot())

  const restoreLastFxLayout = async (platform: Platform) =>
    platform.applySnapshot(lastFxSnapshot)

  return async (instrumentType: InstrumentType) => {
    const platform = await fin.Platform.getCurrent()
    if (instrumentType === InstrumentType.CREDIT) {
      storeCurrentFxLayout(platform)
      platform.applySnapshot(creditSnapshot)
    } else {
      restoreLastFxLayout(platform)
    }
  }
}
interface Props extends WindowControlProps {
  title: string
}

export const WindowHeader: React.FC<Props> = ({ title, ...controlsProps }) => {
  const handleInstrumentTypeSelection =
    useOpenFinInstrumentTypeSelectionHandler()
  return (
    <Header
      controls={
        <>
          <LoginControls />
          <WindowControls {...controlsProps} />
        </>
      }
      filler={<TitleBar>{title}</TitleBar>}
      switches={
        <>
          {IS_CREDIT_ENABLED && (
            <InstrumentTypeSwitch
              handleInstrumentTypeSelection={handleInstrumentTypeSelection}
              initialInstrumentSelected={InstrumentType.FX}
            />
          )}
          <LayoutLock />
          <ThemeSwitcher />
        </>
      }
    />
  )
}
