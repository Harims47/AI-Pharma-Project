import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SearchableSelect({ 
  options = [], 
  value = "", 
  onChange, 
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found."
}) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const containerRef = React.useRef(null)

  const selectedOption = options.find((opt) => String(opt.value) === String(value))

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative w-full" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between bg-background border-muted/20 hover:border-primary/50 text-sm font-normal rounded-xl h-10 px-4"
        onClick={() => setOpen(!open)}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 w-full mt-2 bg-popover text-popover-foreground rounded-xl border border-muted/20 shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          <div className="flex items-center border-b px-3 bg-muted/20">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              autoFocus
              className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground italic">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none hover:bg-primary/10 hover:text-primary transition-colors",
                    String(value) === String(option.value) && "bg-primary/5 text-primary font-bold"
                  )}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                    setSearchTerm("")
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0 transition-opacity",
                      String(value) === String(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate flex-1">{option.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
