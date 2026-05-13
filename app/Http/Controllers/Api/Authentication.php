<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Services\UserService;
use Illuminate\Http\Request;

class Authentication extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        $user = $this->userService->authenticate($data['email'], $data['password']);

        return response()->json([
            'success' => true,
            'message' => 'Autentikasi berhasil.',
            'data' => [
                'token' => $user->createToken($data['device_name'])->plainTextToken,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil keluar dari sistem.',
        ]);
    }

    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $this->userService->siswaRegister($data);

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil. Akun Anda akan segera ditinjau oleh administrator sekolah.',
        ]);
    }
}
