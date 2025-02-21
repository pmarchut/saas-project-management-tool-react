import { Drawer, DrawerContent, DrawerSelectEvent } from '@progress/kendo-react-layout'
import { useMemo } from 'react'
import useLocalStorageState from 'use-local-storage-state'
import { useLocation } from 'react-router'
import routes from '~react-pages'

import { 
    useNavigate, 
    useRoutes 
} from 'react-router-dom'

function TheDrawer() {
    const { pathname } = useLocation()
    const navigate = useNavigate();

    const [expanded, setExpanded] = useLocalStorageState('vue-forge-drawer-expanded', {
        defaultValue: true
    })

    const items = useMemo(() => {
        return [
            {
              text: "Boards",
              icon: "k-i-set-column-position",
              data: {
                path: "/boards",
              },
            },
            {
              text: "Templates",
              icon: "k-i-border-left",
              data: {
                path: "/templates",
              },
            },
            {
              text: "Settings",
              icon: "k-i-gear",
              data: {
                path: "/settings",
              },
            },
            {
              text: "Collapse",
              icon: expanded ? "k-i-arrow-chevron-left" : "k-i-arrow-chevron-right",
              data: {
                action: () => setExpanded(!expanded),
              },
            },
        ]
    }, [expanded, setExpanded])

    const onSelect = (e: DrawerSelectEvent) => {
        const item = items[e.itemIndex];
        if (item.data.path) {
          navigate(item.data.path);
        }
        if (typeof item.data.action === 'function') item.data.action();
    };

    return (
        <Drawer className="h-[90vh]" 
            expanded={expanded} 
            position="start" 
            mode="push" 
            mini={true}
            items={
            items.map((item) => ({
                ...item,
                selected: item.data.path ? pathname.startsWith(item.data.path) : false,
            }))
            }
            onSelect={onSelect}>
            <DrawerContent>
                <div className="p-5">
                    {useRoutes(routes)}
                </div>
            </DrawerContent>
        </Drawer>
    )
  }
  
  export default TheDrawer