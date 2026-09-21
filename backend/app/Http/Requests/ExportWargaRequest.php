<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExportWargaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'blok' => ['nullable', 'string'],
            'status_tempat_tinggal' => ['nullable', 'string'],
        ];
    }
}
