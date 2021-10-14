import { useEffect, useRef, useState } from "react"
import { broadcast } from "@finos/fdc3"
import styled, { css } from "styled-components"
import { Trade, TradeStatus } from "@/services/trades"
import { colConfigs, colFields } from "../TradesState"

const pendingBackgroundColor = css`
  background-color: ${({ theme }) => theme.core.alternateBackground};
`

const TableBodyRow = styled.tr<{ pending?: boolean }>`
  &:nth-child(even) {
    background-color: ${({ theme }) => theme.core.darkBackground};
  }
  &:hover {
    background-color: ${({ theme }) => theme.core.alternateBackground};
  }
  height: 2rem;
  ${({ pending }) => pending && pendingBackgroundColor}
`

const TableBodyCell = styled.td<{ numeric?: boolean; rejected?: boolean }>`
  text-align: ${({ numeric }) => (numeric ? "right" : "left")};
  padding-right: ${({ numeric }) => (numeric ? "1.6rem;" : "0.1rem;")};
  position: relative;
  &:before {
    content: " ";
    display: ${({ rejected }) => (rejected ? "block;" : "none;")};
    position: absolute;
    top: 50%;
    left: 0;
    border-bottom: 1px solid red;
    width: 100%;
  }
`

const StatusIndicator = styled.td<{ status?: TradeStatus }>`
  width: 18px;
  border-left: 6px solid
    ${({ status, theme: { accents } }) =>
      status === TradeStatus.Done
        ? accents.positive.base
        : status === TradeStatus.Rejected
        ? accents.negative.base
        : "inherit"};
`

const StatusIndicatorSpacer = styled.th`
  width: 18px;
  top: 0;
  position: sticky;
  background-color: ${({ theme }) => theme.core.lightBackground};
  border-bottom: 0.25rem solid ${({ theme }) => theme.core.darkBackground};
`

export const TableBodyRowContainer: React.FC<{
  trade: Trade
  isInitialRender: boolean
}> = ({ trade, isInitialRender }) => {
  const [shouldHighlight, setShouldHighlight] = useState<boolean>(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!isInitialRender) {
      setShouldHighlight(true)

      timeoutRef.current = setTimeout(() => {
        setShouldHighlight(false)
      }, 3000)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
    // isInitialRender missing from deps so we only run the hook once on mount
    // eslint-disable-next-line
  }, [])

  const tryBroadcastContext = (symbol: string) => {
    if (window.fdc3) {
      broadcast({
        type: "fdc3.instrument",
        id: { ticker: symbol },
      })
    }
  }

  return (
    <TableBodyRow
      key={trade.tradeId}
      pending={trade.status === TradeStatus.Pending || shouldHighlight}
      onClick={() => tryBroadcastContext(trade.symbol)}
    >
      <StatusIndicator status={trade.status} aria-label={trade.status} />
      {colFields.map((field, i) => (
        <TableBodyCell
          key={field}
          numeric={
            colConfigs[field].filterType === "number" && field !== "tradeId"
          }
          rejected={trade.status === "Rejected"}
        >
          {colConfigs[field].valueFormatter?.(trade[field]) ?? trade[field]}
        </TableBodyCell>
      ))}
    </TableBodyRow>
  )
}

export const EmptyTableRow = () => (
  <TableBodyRow>
    <StatusIndicatorSpacer aria-hidden={true} />
    <TableBodyCell colSpan={colFields.length}>No trades to show</TableBodyCell>
  </TableBodyRow>
)
