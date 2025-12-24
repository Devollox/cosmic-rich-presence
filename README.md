<h1 align="center">
 <img width="451" height="493" alt="image" src="https://github.com/user-attachments/assets/b62c9136-0212-4f21-a6fd-250e43cdf886" />

  <img width="247" height="163" alt="image" src="https://github.com/user-attachments/assets/29ee6257-4200-4dee-95c4-fa3b023fa098" />

</h1>

# Cosmic Rich Presence

Cosmic Rich Presence is a small Electron application that shows the dynamic status of observing space objects in Discord.

## Features

- Automatically search for a running Discord and connect to Rich Presence.
- Random selection of an astronomical object from the built-in catalog.
- Step-by-step updating of information: first the coordinates, then the extended characteristics of the object.
- Two customizable buttons in Discord activity.

## Buttons in Discord

Two buttons are always displayed in the Discord activity:

1. **Space Object (first button)**  
   Leads to the website [sky-map.org ](https://www.sky-map.org ), opening the page of the current object with the desired image type and zoom level.

2. **The second button (dynamic)**  
   This button changes its purpose every 30 seconds:
- Or it shows a link to your Steam profile.  
   - Or it shows a link to your personal website.  

The current signature and link of the second button are set in the application interface and saved in the config, so as not to re-enter them the next time you start. 

## Setting up

1. Create an app in the [Discord Developer Portal](https://discord.com/developers/applications ) and take his **Client ID**.
2. In the Cosmic Rich Presence window, specify:
   - `clientId`
   - label and URL for Steam buttons(example)
   - label and URL for the Website-buttons(example)
3. Press **SAVE**, after which Presence will automatically restart.

Without the filled in `ClientID` and both sets of values (label + url), the Rich Presence script does not run.
