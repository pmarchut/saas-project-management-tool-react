import { NotificationGroup, Notification } from '@progress/kendo-react-notification'
import { Fade } from '@progress/kendo-react-animation'
import { useAppDispatch, useAppSelector } from '@/stores/store'
import { remove } from '@/stores/alertsSlice';

function TheAlerts() {
    const alerts = useAppSelector((state) => state.alerts);
    const dispatch = useAppDispatch()

    return (
        <div className="z-10">
            <NotificationGroup
                className="gap-2"
                style={{
                    right: '10px',
                    bottom: '10px',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap-reverse'
                }}
            >
                {alerts.items.map((alert) => (
                    <Fade key={alert.id} appear>
                        <Notification
                            className="!flex items-center justify-items-center gap-1"
                            type={{
                                style: alert.style,
                                icon: true,
                            }}
                            closable={alert.closable}
                            onClose={() => dispatch(remove(alert.id))}
                        >
                            {alert.html ? <div dangerouslySetInnerHTML={{ __html: alert.message }} /> 
                                : <span>{ alert.message }</span>}
                        </Notification>
                    </Fade>  
                ))}
            </NotificationGroup>
        </div>
    )
}
    
export default TheAlerts