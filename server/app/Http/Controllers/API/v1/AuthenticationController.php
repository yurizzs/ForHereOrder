<?php
namespace App\Http\Controllers\API\v1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Resources\StudentResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthenticationController extends Controller
{
    use ApiResponse;

    private function authUserResource(User $user): JsonResource
    {
        if ($user->role === UserRole::STUDENT) {
            return new StudentResource($user);
        }

        return new UserResource($user);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username'       => ['required', 'string'],
            'password'    => ['required', 'string'],
            'device_name' => ['sometimes', 'string'], // Mobile only
        ]);

        if (!Auth::attempt($request->only('username', 'password'))) {
            return $this->error('Invalid username or password.', 401);
        }
        $user = Auth::user();

        if ($request->filled('device_name')) {
            // Revoke any existing tokens for this device (prevent duplicates)
            $user->tokens()->where('name', $request->device_name)->delete();
            $token = $user->createToken($request->device_name)->plainTextToken;
            return $this->success(
                'Logged in successfully.',
                [
                    'user'  => $this->authUserResource($user),
                    'token' => $token,
                ],
                200
            );
        }

        $request->session()->regenerate();
        return $this->success(
            'Logged in successfully.',
            ['user' => $this->authUserResource($user)],
            200
        );
    }
    /**
     * Return the currently authenticated user.
     *
     * Works for both web (session) and mobile (Bearer token)
     * because Sanctum's auth middleware handles both guards.
     */
    public function me(Request $request): JsonResponse
    {
        return $this->success(
            'Authenticated user retrieved.',
            ['user' => $this->authUserResource($request->user())],
            200
        );
    }
    /**
     * Log out the current user.
     *
     * - Mobile: revokes the current access token.
     * - Web: invalidates the session.
     */
    public function logout(Request $request): JsonResponse
    {
        // ──────────────────────────────────────────
        // MOBILE: revoke the Bearer token used for this request
        // ──────────────────────────────────────────
        if ($request->user()->currentAccessToken() &&
            method_exists($request->user()->currentAccessToken(), 'delete')) {
            $request->user()->currentAccessToken()->delete();
            return $this->success('Logged out successfully.', null, 200);
        }
        // ──────────────────────────────────────────
        // WEB SPA: invalidate the session (unchanged)
        // ──────────────────────────────────────────
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return $this->success('Logged out successfully.', null, 200);
    }

    /**
     * Register a new student user.
     */
    public function registerStudent(StoreStudentRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => UserRole::STUDENT,
        ]);

        $token = $user->createToken('student-api-token')->plainTextToken;

        return $this->success(
            'Student registered successfully.',
            [
                'user' => new StudentResource($user),
                'token' => $token,
            ],
            201
        );
    }
}
