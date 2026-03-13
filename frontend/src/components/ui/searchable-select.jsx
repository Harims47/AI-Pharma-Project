import * as React from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function SearchableSelect({ 
  options = [], 
  value = "", 
  onChange, 
  placeholder = "Select option...",
  emptyMessage = "No results found."
}) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const containerRef = React.useRef(null)
  const inputRef = React.useRef(null)

  const selectedOption = options.find((opt) => String(opt.value) === String(value))
  
  // When an option is selected, we want the input to show its label
  // When the user starts typing, we use the searchTerm
  const displayValue = open ? searchTerm : (selectedOption ? selectedOption.label : "")

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
        setSearchTerm("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputFocus = () => {
    setOpen(true)
    // If there's a selected option, start search with its label or empty
    setSearchTerm("")
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange("")
    setSearchTerm("")
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          className="w-full h-10 px-4 pr-10 rounded-xl border border-muted/20 bg-background text-sm shadow-sm hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground"
          placeholder={selectedOption ? selectedOption.label : placeholder}
          value={displayValue}
          onFocus={handleInputFocus}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            if (!open) setOpen(true)
          }}
        />
        <div className="absolute right-3 top-2.5 flex items-center gap-1">
          {value && (
            <button 
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
            >
              <X size={14} />
            </button>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 text-muted-foreground" />
        </div>
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-2 bg-popover text-popover-foreground rounded-xl border border-muted/20 shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground italic">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none hover:bg-primary/10 hover:text-primary transition-colors",
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
