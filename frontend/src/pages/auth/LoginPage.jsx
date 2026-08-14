import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { login, getMe } from '../../api/auth.api';import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTokens, setUser } = useAuthStore();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ username, password });
      const { accessToken, refreshToken } = response.data;
      setTokens(accessToken, refreshToken);

      const meResponse = await getMe();
      setUser(meResponse.data);

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (/*#__PURE__*/
    _jsxDEV("div", { className: "flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8", children: [/*#__PURE__*/
      _jsxDEV("div", { className: "sm:mx-auto sm:w-full sm:max-w-sm", children: /*#__PURE__*/
        _jsxDEV("h2", { className: "mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900", children: "Sign in to your account" }, void 0, false

        ) }, void 0, false
      ), /*#__PURE__*/

      _jsxDEV("div", { className: "mt-10 sm:mx-auto sm:w-full sm:max-w-sm", children: /*#__PURE__*/
        _jsxDEV("form", { className: "space-y-6", onSubmit: handleSubmit, children: [
          error && /*#__PURE__*/
          _jsxDEV("div", { className: "rounded-md bg-red-50 p-4", children: /*#__PURE__*/
            _jsxDEV("div", { className: "text-sm text-red-700", children: error }, void 0, false) }, void 0, false
          ), /*#__PURE__*/

          _jsxDEV("div", { children: [/*#__PURE__*/
            _jsxDEV("label", { htmlFor: "username", className: "block text-sm font-medium leading-6 text-gray-900", children: "Username" }, void 0, false

            ), /*#__PURE__*/
            _jsxDEV("div", { className: "mt-2", children: /*#__PURE__*/
              _jsxDEV("input", {
                id: "username",
                name: "username",
                type: "text",
                required: true,
                value: username,
                onChange: (e) => setUsername(e.target.value),
                className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
              ) }, void 0, false
            )] }, void 0, true
          ), /*#__PURE__*/

          _jsxDEV("div", { children: [/*#__PURE__*/
            _jsxDEV("div", { className: "flex items-center justify-between", children: /*#__PURE__*/
              _jsxDEV("label", { htmlFor: "password", className: "block text-sm font-medium leading-6 text-gray-900", children: "Password" }, void 0, false

              ) }, void 0, false
            ), /*#__PURE__*/
            _jsxDEV("div", { className: "mt-2", children: /*#__PURE__*/
              _jsxDEV("input", {
                id: "password",
                name: "password",
                type: "password",
                required: true,
                value: password,
                onChange: (e) => setPassword(e.target.value),
                className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
              ) }, void 0, false
            )] }, void 0, true
          ), /*#__PURE__*/

          _jsxDEV("div", { children: /*#__PURE__*/
            _jsxDEV("button", {
              type: "submit",
              disabled: loading,
              className: "flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400", children:

              loading ? 'Signing in...' : 'Sign in' }, void 0, false
            ) }, void 0, false
          )] }, void 0, true
        ) }, void 0, false
      )] }, void 0, true
    ));

};