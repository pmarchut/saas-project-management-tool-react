import { Button as KButton } from '@progress/kendo-react-buttons';

function TheNavbar() {
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
            className="mr-5 text-[#ff6358]"
          >
            <span className="k-icon k-i-ungroup"></span>
            My Team
          </button>
    
          <KButton rounded="full" icon='logout' themeColor="warning">Logout</KButton>
        </div>
      </div>
    )
  }
  
  export default TheNavbar