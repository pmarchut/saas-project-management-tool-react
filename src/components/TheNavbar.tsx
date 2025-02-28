import { Button as KButton } from '@progress/kendo-react-buttons';
import { Popup as KPopup } from '@progress/kendo-react-popup';
import { useRef, useState } from 'react';
import { useAppSelector } from '@/stores/store';
import { useNavigate } from 'react-router-dom'

function TheNavbar() {
  const button = useRef<HTMLButtonElement | null>(null);
  const [showTeams, setShowTeams] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  return (
    <div
      className="p-4 border-bottom border-2 flex justify-between"
      style={{ marginBottom: "-1px", marginTop: "-1px" }}
    >
      <img 
        src="https://vuejsforge.com/.netlify/images?url=%2Fimages%2Flogo-vuejs-forge.svg"
        width="150"
        className="max-w-none"
        alt="Vue.js Forge"
      />
      <div>
        <button
          ref={button}
          className="mr-5 text-[#ff6358]"
          onClick={() => setShowTeams(!showTeams)}
        >
          <span className="k-icon k-i-ungroup"></span>
          My Team
        </button>
        <KPopup anchor={button.current && button.current} show={showTeams} className="mt-5">
          <ul>
            {user?.team.items.map((team) => (
              <li 
                key={team.id}
                className="px-5 py-2" 
                onClick={() => setShowTeams(false)}>
                { team.name }
              </li>
            ))}
          </ul>
        </KPopup>
    
        <KButton rounded="full" icon='logout' themeColor="warning" onClick={() => navigate("/logout")}>Logout</KButton>
      </div>
    </div>
  )
}
  
export default TheNavbar