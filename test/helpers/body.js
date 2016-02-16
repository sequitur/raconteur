module.exports = `<div id="toolbar">
  <h1>Raconteur</h1>
  <div class="nav">
    <a href="#" class="button" id="menu-button">Menu</a>
  </div>
</div>
<ul id="menu">
  <li><a href="#title, #content_wrapper">Story</a></li>
  <li><a href="#character_panel">Character</a></li>
  <li><a href="#info_panel">Info</a></li>
</ul>

<div id="page">

  <div id="tools_wrapper">
    <div id="info_panel" class="tools left">
      <div class='buttons'>
        <button id="save">Save</button><button id="erase">Erase</button>
      </div>
    </div>

    <div id="character_panel" class="tools right">
      <h1>Character</h1>
      <div id="character">
        <div id="character_text">
          <div id="character_text_content"></div>
        </div>
        <div id="qualities"></div>
      </div>
    </div>
  </div>

  <div id="mid_panel">
    <div id="title">
      <div class="label">
        <p class="click_message">click to begin</p>
      </div>
    </div>

    <div id="content_wrapper">
      <div id="content">
      </div>
      <a name="end_of_content"></a>
    </div>

    <div id="legal">
    </div>
  </div>
</div>`
