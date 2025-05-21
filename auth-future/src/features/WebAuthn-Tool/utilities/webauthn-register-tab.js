function passkeyTabTitle() {
    return (
        <>
            <div id="passkey-tab-title" style={{color: '#FFF', backgroundColor: '#2a2a2a'}}><h4>Create New Passkey</h4></div>
        </>
    )
}

function renderPasskeyRegisterTab() {
    if (registerNewPasskeyTab === 1) {
        return (
            <>
                {passkeyTabTitle()}
                {RenderPasskeyRegisterTabPage1()}
            </>
        )
    } else if (registerNewPasskeyTab === 2) {
        return (
            <>
                {passkeyTabTitle()}
                {RenderPasskeyRegisterTabPage2()}
            </>
        )
    } 
}