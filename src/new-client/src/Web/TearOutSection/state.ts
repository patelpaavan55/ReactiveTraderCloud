import { bind } from "@react-rxjs/core"
import { createSignal } from "@react-rxjs/utils"
import { map, filter } from "rxjs/operators"

type TearOutSectionEntry = [boolean, string]

export const [tearOutSectionEntry$, tearOutSection] = createSignal(
  (bool: boolean, section: string): TearOutSectionEntry => [bool, section],
)

export const [useTearOutSectionEntry] = bind<TearOutSectionEntry | null>(
  tearOutSectionEntry$,
  null,
)
export const [useTearOutSectionState$] = bind(
  (id: string) =>
    tearOutSectionEntry$.pipe(
      filter((val) => val[1] === id),
      map((val) => {
        return val[0]
      }),
    ),
  false,
)
