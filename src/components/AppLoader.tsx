import { Loader as KLoader } from '@progress/kendo-react-indicators'

function AppLoader({overlay}: {overlay: boolean}) {
    return (
        <div className={overlay ? 'absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center bg-white/95 z-10' : ''}>
            <KLoader type="pulsing" />
        </div>
    )
}
  
export default AppLoader