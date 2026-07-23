import { type FC, Suspense } from "react"

import { Router } from "@/components/Router"

const App: FC = () => (
    <Suspense fallback={null}>
        <Router />
    </Suspense>
)

export default App
