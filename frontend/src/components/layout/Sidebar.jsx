import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  ArrowUpTrayIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  PaperAirplaneIcon } from
'@heroicons/react/24/outline';
import clsx from 'clsx';import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

const navigation = [
{ name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
{ name: 'Excel Import', href: '/import', icon: ArrowUpTrayIcon },
{ name: 'Price Lists', href: '/price-lists', icon: CurrencyDollarIcon },
{ name: 'Agent Data', href: '/agents', icon: UsersIcon },
{ name: 'Airlines', href: '/airlines', icon: PaperAirplaneIcon },
{ name: 'Transactions', href: '/transactions', icon: CreditCardIcon },
{ name: 'Reports', href: '/reports', icon: ChartBarIcon },
{ name: 'Notes', href: '/notes', icon: ChatBubbleLeftRightIcon },
{ name: 'Settings', href: '/settings', icon: Cog6ToothIcon }];

export const Sidebar = () => {
  const { t } = useTranslation();

  return (/*#__PURE__*/
    _jsxDEV("div", { className: "flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4", children: [/*#__PURE__*/
      _jsxDEV("div", { className: "flex h-16 shrink-0 items-center", children: /*#__PURE__*/
        _jsxDEV("h1", { className: "text-white font-bold text-xl", children: "AAMS" }, void 0, false) }, void 0, false
      ), /*#__PURE__*/
      _jsxDEV("nav", { className: "flex flex-1 flex-col", children: /*#__PURE__*/
        _jsxDEV("ul", { role: "list", className: "flex flex-1 flex-col gap-y-7", children: /*#__PURE__*/
          _jsxDEV("li", { children: /*#__PURE__*/
            _jsxDEV("ul", { role: "list", className: "-mx-2 space-y-1", children:
              navigation.map((item) => /*#__PURE__*/
              _jsxDEV("li", { children: /*#__PURE__*/
                _jsxDEV(NavLink, {
                  to: item.href,
                  className: ({ isActive }) =>
                  clsx(
                    isActive ?
                    'bg-gray-800 text-white' :
                    'text-gray-400 hover:bg-gray-800 hover:text-white',
                    'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                  ), children: [/*#__PURE__*/

                  _jsxDEV(item.icon, { className: "h-6 w-6 shrink-0", "aria-hidden": "true" }, void 0, false),
                  t(`navigation.${item.name}`)] }, void 0, true
                ) }, item.name, false
              )
              ) }, void 0, false
            ) }, void 0, false
          ) }, void 0, false
        ) }, void 0, false
      )] }, void 0, true
    ));

};