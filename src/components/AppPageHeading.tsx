import { ReactNode } from "react"

function AppPageHeading({children}: {children: ReactNode}) {
    return (
      <h1 className="text-3xl mb-5">
        {children}
      </h1>
    )
  }
  
export default AppPageHeading