<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default admin from .env
        Admin::create([
            'name' => 'Administrator',
            'email' => env('ADMIN_EMAIL', 'admin@celeste.local'),
            'password' => bcrypt(env('ADMIN_PASSWORD', 'password')),
        ]);

        // Or use a fixed password for seeding
        Admin::create([
            'name' => 'Admin Celeste',
            'email' => 'admin@celeste.com',
            'password' => bcrypt('admin123'),
        ]);
    }
}
