import styled from "styled-components"
import { colFields, useTableTrades } from "../TradesState"
import { TableHeadCellContainer } from "./TableHeadCell"
import { EmptyTableRow, TableBodyRowContainer } from "./TableBodyRow"
import { useEffect, useState } from "react"

const TableWrapper = styled.div`
  height: calc(100% - 4.75rem);
  overflow-x: scroll;
  overflow-y: scroll;
`

const Table = styled.table`
  background-color: ${({ theme }) => theme.core.lightBackground};
  position: relative;
  width: 100%;
  min-width: 60rem;
  border-collapse: separate;
  border-spacing: 0;

  .visually-hidden {
    display: none;
  }
`

const TableHead = styled.thead`
  font-size: 0.675rem;
  text-transform: uppercase;
`

const TableHeadRow = styled.tr`
  vertical-align: center;
  height: 2rem;
`

const StatusIndicatorSpacer = styled.th`
  width: 18px;
  top: 0;
  position: sticky;
  background-color: ${({ theme }) => theme.core.lightBackground};
  border-bottom: 0.25rem solid ${({ theme }) => theme.core.darkBackground};
`

export const TradesGrid: React.FC = () => {
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true)
  const trades = useTableTrades()

  useEffect(() => {
    if (isInitialRender && trades.length) {
      setIsInitialRender(false)
    }
  }, [trades, isInitialRender])

  return (
    <TableWrapper>
      <Table>
        <caption id="trades-table-heading" className="visually-hidden">
          Reactive Trader FX Trades Table
        </caption>
        <TableHead>
          <TableHeadRow>
            <StatusIndicatorSpacer scope="col" aria-label="Trade Status" />
            {colFields.map((field) => (
              <TableHeadCellContainer key={field} field={field} />
            ))}
          </TableHeadRow>
        </TableHead>
        <tbody role="grid">
          {trades.length ? (
            trades.map((trade) => (
              <TableBodyRowContainer
                key={trade.tradeId}
                trade={trade}
                isInitialRender={isInitialRender}
              />
            ))
          ) : (
            <EmptyTableRow />
          )}
        </tbody>
      </Table>
    </TableWrapper>
  )
}
