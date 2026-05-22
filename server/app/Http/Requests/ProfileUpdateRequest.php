<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ProfileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = $this->user();

        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'phone' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('users', 'phone')->ignore($user->id),
            ],
            'password' => [
                'nullable',
                'string',
                Password::min(8)->mixedCase()->numbers()->symbols(),
                'confirmed',
            ],
            'password_confirmation' => [
                'nullable',
                'required_with:password',
                'string',
            ],
            'avatar' => ['nullable', 'image', 'max:5120'], // 5MB limit
        ];
    }

    public function messages(): array
    {
        return [
            'avatar.image' => 'The profile picture must be a valid image file.',
            'avatar.max' => 'The image size must not exceed 5MB.',
        ];
    }
}
