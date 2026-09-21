<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CekKtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'no_ktp' => [
                'required',
                'string',
                'size:16',
                'regex:/^\d{16}$/',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'no_ktp.required' => 'No. KTP wajib diisi.',
            'no_ktp.size' => 'No. KTP harus 16 digit.',
            'no_ktp.regex' => 'No. KTP harus berupa angka 16 digit.',
        ];
    }
}
