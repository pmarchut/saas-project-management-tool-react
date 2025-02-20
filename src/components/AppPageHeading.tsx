import { ReactNode } from "react"

function AppPageHeading({children}: {children: ReactNode}) {
    return (
      <h1 className="text-3xl font-bold underline">
        {children}
      </h1>
    )
  }
  
  export default AppPageHeading