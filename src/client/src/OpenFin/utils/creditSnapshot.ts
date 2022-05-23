import { Snapshot } from "openfin/_v2/shapes/Platform"

export const creditSnapshot: Snapshot = {
  windows: [
    {
      uuid: "main-credit-window",
      icon: `${window.location.origin}/static/media/reactive-trader-icon-256x256.png`,
      autoShow: true,
      defaultWidth: 1280,
      defaultHeight: 900,
      minWidth: 800,
      minHeight: 600,
      defaultCentered: true,
      resizable: true,
      maximizable: true,
      saveWindowState: true,
      frame: false,
      shadow: true,
      preload: [
        {
          url: `${window.location.origin}/plugin/service-loader.js`,
        },
        {
          url: `${window.location.origin}/plugin/fin.desktop.Excel.js`,
        },
      ],
      contextMenu: true,
      accelerator: {
        devtools: true,
        reload: true,
        reloadIgnoringCache: true,
        zoom: true,
      },
      url: `${window.location.origin}/openfin-window-frame`,
      name: "Reactive-Trader-MAIN",
      layout: {
        settings: {
          constrainDragToContainer: false,
          popoutWholeStack: false,
          showCloseIcon: false,
          showMaximiseIcon: false,
          showPopoutIcon: true,
        },
        content: [
          {
            type: "row",
            content: [
              {
                type: "component",
                componentName: "view",
                componentState: {
                  identity: { uuid: "credit-placeholder" },
                  url: `${window.location.origin}/credit`,
                  title: "Credit",
                },
              },
            ],
          },
        ],
      },
    },
  ],
}
