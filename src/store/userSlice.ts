import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {GetInfo, LoginApi} from "api/userApi";
import {Decrypt, Encrypt} from "common/function";

export const Login = createAsyncThunk("user/login", async (params: {username: string; password: string}, {rejectWithValue}) => {
	const loginResult: any = await LoginApi(params.username, params.password);

	if (loginResult.data.success) {
		try {
			var info = await GetInfo(loginResult.data.payload.id, loginResult.data.payload.token);
			if (info.data.success) {
				var userInfo = {
					token: loginResult.data.payload.token,
					role: loginResult.data.payload.role,
					id: loginResult.data.payload.id,
					username: info.data.payload.username,
					avatar: info.data.payload.avatar,
					fullName: info.data.payload.fullName,
					isMale: info.data.payload.isMale,
					email: info.data.payload.email,
					dob: info.data.payload.dob,
					phonenumber: info.data.payload.phonenumber,
					address: info.data.payload.address,
				};
				localStorage.setItem("userInfo", Encrypt(JSON.stringify(userInfo)));

				return userInfo;
			} else {
				return rejectWithValue({
					error: info.data.message,
				});
			}
		} catch (err) {
			return rejectWithValue({
				error: err.message,
			});
		}
	} else {
		return rejectWithValue({
			error: loginResult.data.message,
		});
	}
});

const userInfoInit = JSON.parse(
	Decrypt(localStorage.getItem("userInfo") || "{}") ||
		JSON.stringify({
			token: "",
			role: "",
			id: "",
		})
);

const userSlice = createSlice({
	name: "user",
	initialState: {
		current: userInfoInit,
		loading: false,
		error: "",
	},
	reducers: {
		Logout: (state) => {
			localStorage.removeItem("userInfo");
			localStorage.removeItem("cart");
			state.current = {
				token: "",
				role: "",
				id: "",
			};
		},
		Update: (
			state,
			action: PayloadAction<{
				fullName: string;
				isMale: boolean;
				email: string;
				address: string;
				phoneNumber: string;
				avatar: string;
				dob: string;
			}>
		) => {
			state.current = {
				...state.current,
				...action.payload,
			};
			localStorage.setItem("userInfo", Encrypt(JSON.stringify(state.current)));
		},
	},
	extraReducers: {
		[Login.pending as any]: (state, action) => {
			state.loading = true;
		},
		[Login.rejected as any]: (state, action) => {
			state.loading = false;
			state.error = action.payload;
		},
		[Login.fulfilled as any]: (state, action) => {
			state.loading = false;
			state.current = action.payload;
		},
	},
});

const {reducer: userReducer} = userSlice;

export default userReducer;

export const {Logout, Update} = userSlice.actions;
