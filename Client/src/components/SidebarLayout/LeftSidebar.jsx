import React, { useContext, useEffect, useState } from "react";
import MessageIcon from "@mui/icons-material/Message";
import PersonIcon from "@mui/icons-material/Person";
import PublicIcon from "@mui/icons-material/Public";
import GroupIcon from "@mui/icons-material/Group";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

import { Link, useLocation } from "react-router-dom";
import UserContext from "../../context/UserContext";

export default function LeftSidebar() {

  const location = useLocation();
  const { loginUser } = useContext(UserContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setSelected(location.pathname);
  }, [location.pathname]);

  const sections = [
    { icon: MessageIcon, title: "Message", redirectLink: "/u/chatting" },
    { icon: PersonIcon, title: "Private Status", redirectLink: "/status/private" },
    { icon: PublicIcon, title: "Public Status", redirectLink: "/status/public" },
    { icon: GroupIcon, title: "Live Users", redirectLink: "/live-users" },
    { icon: GroupAddIcon, title: "Join", redirectLink: "/u/join-requests" },
    { icon: SettingsIcon, title: "Profile", redirectLink: `/u/profile/${loginUser?.username}`, },
  ];

  return (
    <>
      <div className="hidden md:flex group px-3 py-2 w-16 hover:w-60 transition-all duration-300 overflow-hidden h-full">
        <div className="flex-1 w-full space-y-4 overflow-y-auto hide-scroll">
          <Link
            to={"/"}
            className="flex items-center space-x-3 mt-1 p-1 transition-all hover:cursor-pointer z-10 sticky top-0 left-0"
          >
            <span className="border-2 p-1 rounded-full border-orange-500">
              <PersonAddRoundedIcon className="text-orange-500" />
            </span>
            <div
              className="tracking-wide text-2xl bg-gradient-to-r from-[#ef4136] to-[#fbb040] bg-clip-text text-transparent whitespace-nowrap transition-all duration-300 opacity-0 translate-x-[-20px] group-hover:opacity-100 group-hover:translate-x-0"
              style={{ fontWeight: "900", fontFamily: "cursive" }}
            >
              ChatMeetUp
            </div>
          </Link>

          {sections.map((section) => (
            <Link
              to={section.redirectLink}
              className={`flex items-center space-x-3 p-[0.65rem] rounded-xl shadow-lg ${location.pathname.startsWith(section.redirectLink) ? 'bg-[#80808045] text-blue-500' : 'bg-[#80808023] text-gray-500'} hover:text-white`}
              key={section.redirectLink}
              onClick={() => setSelected(section.redirectLink)}
            >
              {React.createElement(section.icon, {
                style: { fontSize: "1.2rem" },
              })}
              <span
                className={`opacity-0 translate-x-[-20px] group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap transition-all duration-300`}
              >
                {section.title}
              </span>
            </Link>
          ))}

        </div>
      </div>

      <div
        className={`md:hidden w-full h-fit flex justify-between items-center px-3 py-2 ${!isDrawerOpen && "border-b-2 border-orange-500"
          }`}
      >
        <div className="text-2xl py-2 bg-gradient-to-r from-[#ef4136] to-[#fbb040] bg-clip-text text-transparent">
          <Link
            to={"/"}
            className="hover:cursor-pointer z-10"
            style={{ fontWeight: "900", fontFamily: "cursive" }}
          >
            ChatMeetUp
          </Link>
        </div>

        {!isDrawerOpen && (
          <Button onClick={() => setIsDrawerOpen(true)}>
            <MenuIcon sx={{ fontSize: "2rem", color: "white" }} />
          </Button>
        )}

        <Drawer
          anchor={"top"}
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          PaperProps={{
            sx: {
              backgroundColor: "transparent",
              color: "#cccccc",
            },
          }}
        >
          <div className="relative space-y-5 text-center bg-linear-to-r from-[#101010] to-[#ff9a006b] pt-3 border-b-3 border-orange-500">
            {sections.map((section, idx) => (
              <Link
                to={section.redirectLink}
                className="flex justify-center items-center space-x-3 hover:text-white"
                key={section.redirectLink}
                onClick={() => setIsDrawerOpen(false)}
              >
                {React.createElement(section.icon, {
                  style: { fontSize: "1.2rem" },
                })}
                <span className="whitespace-nowrap">{section.title}</span>
              </Link>
            ))}
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="absolute top-2 right-2 text-white p-1 rounded bg-[#ff45003b] cursor-pointer"
            >
              <CloseIcon />
            </button>
          </div>
        </Drawer>
      </div>
    </>
  );
}
