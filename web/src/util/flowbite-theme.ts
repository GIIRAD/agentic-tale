import { createTheme } from "flowbite-react";

export const flowbiteTheme = createTheme({
  // tooltip: {
  //   base: " z-10 inline-block rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-white shadow-md",
  // },
  modal: {
    header: {
      close: {
        base: "ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 outline-0 hover:bg-gray-200 hover:text-gray-900 focus:ring-4 focus:ring-primary-300",
      },
    },
  },

  button: {
    color: {
      light:
        "border border-gray-300 bg-white text-gray-900 focus:ring-4 focus:ring-primary-300 enabled:hover:bg-gray-100",
      primary:
        "border border-transparent bg-primary-600 text-white focus:ring-4 focus:ring-primary-300 enabled:hover:bg-primary-700",
    },
  },

  toggleSwitch: {
    toggle: {
      checked: {
        color: {
          primary: "border-primary-600 bg-primary-600",
        },
      },
    },
  },

  checkbox: {
    base: "cursor-pointer",
    color: {
      primary: "text-primary-600 focus:ring-primary-600",
    },
  },

  textInput: {
    field: {
      input: {
        colors: {
          gray: "border-gray-300 bg-gray-50 text-gray-900 focus:border-primary-600 focus:ring-primary-600",
        },
      },
    },
  },

  textarea: {
    colors: {
      gray: "border-gray-300 bg-gray-50 text-gray-900 focus:border-primary-600 focus:ring-primary-600",
    },
  },

  select: {
    field: {
      select: {
        base: "cursor-pointer",
        colors: {
          gray: "border-gray-300 bg-gray-50 text-gray-900 focus:border-primary-600 focus:ring-primary-600",
        },
      },
    },
  },

  navbar: {
    root: {
      base: "bg-white",
    },
    toggle: {
      base: "p-3 lg:hidden",
      icon: "size-4 shrink-0",
    },
    link: {
      base: "block px-4 py-2 text-gray-700 lg:px-0 lg:py-1",
      active: {
        on: "border-l-2 border-primary-600 text-primary-600 hover:text-primary-600 lg:border-b-2 lg:border-l-0",
        off: "border-l-2 border-white text-gray-700 hover:text-primary-600 lg:border-b-2 lg:border-l-0",
      },
    },
    collapse: {
      base: "w-full items-center justify-between lg:order-1 lg:flex lg:w-auto",
      list: "flex flex-col pt-4 font-semibold lg:flex-row lg:gap-8 lg:p-0",
    },
  },

  breadcrumb: {
    root: {
      list: "flex flex-wrap items-center",
    },
    item: {
      base: "group flex items-center py-1",
    },
  },

  table: {
    root: {
      wrapper: "relative sm:min-h-[489px]", // default table height
    },
    body: {
      cell: {
        base: "p-0",
      },
    },
  },

  pagination: {
    pages: {
      base: "inline-flex items-center -space-x-px",
      previous: {
        base: "flex h-9 items-center justify-center rounded-l-lg border bg-white px-2 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700",
      },
      next: {
        base: "flex h-9 items-center justify-center rounded-r-lg border bg-white px-2 py-1.5 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700",
      },
      selector: {
        base: "flex h-9 w-10 items-center justify-center border bg-white text-sm leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700",
        active: "z-10 text-sm font-semibold text-gray-900",
      },
    },
  },

  datepicker: {
    popup: {
      root: {
        base: "absolute top-10 z-50 block",
        inner: "inline-block bg-white p-4 shadow-none",
      },
      footer: {
        button: {
          today:
            "bg-primary-600 text-white outline-0 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300",
          clear:
            "border border-gray-300 bg-white text-gray-900 outline-0 focus:ring-4 focus:ring-primary-300 enabled:hover:bg-gray-100",
        },
      },
    },
    views: {
      days: {
        items: {
          base: "grid w-[264px] grid-cols-7 gap-0.5",
          item: {
            base: "block size-9 flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-gray-900 hover:bg-gray-100",
            selected: "bg-primary-600 text-white hover:bg-primary-500",
          },
        },
      },
      months: {
        items: {
          item: {
            selected: "bg-primary-600 text-white hover:bg-primary-500",
          },
        },
      },
      years: {
        items: {
          item: {
            selected: "bg-primary-600 text-white hover:bg-primary-500",
          },
        },
      },
      decades: {
        items: {
          item: {
            selected: "bg-primary-600 text-white hover:bg-primary-500",
          },
        },
      },
    },
  },

  tabs: {
    base: "flex flex-col",
    tablist: {
      base: "flex overflow-y-auto text-center",
      variant: {
        fullWidth:
          "grid w-full grid-flow-col divide-x divide-white rounded-t-md",
      },
      tabitem: {
        base: "flex items-center justify-center rounded-t-lg p-5 font-medium first:ml-0 focus:outline-none disabled:cursor-not-allowed",
        variant: {
          fullWidth: {
            base: "ml-0 flex w-full rounded-none first:ml-0",
            active: {
              on: "bg-primary-600 p-5 text-white",
              off: "bg-gray-200 text-gray-500 hover:bg-primary-600 hover:text-white",
            },
          },
        },
      },
    },
    tabpanel: "p-0",
  },
});
