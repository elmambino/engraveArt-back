# Функция для выполнения запроса и обработки ответа
function Test-OrderValidation {
    param(
        [string]$TestName,
        [hashtable]$RequestBody
    )
    
    Write-Host "`n=== $TestName ===" -ForegroundColor Cyan
    
    $jsonBody = $RequestBody | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8182/api/orders" -Method POST -Body $jsonBody -ContentType "application/json"
        $content = $response.Content | ConvertFrom-Json
        Write-Host "✅ Успех: $($content.message)" -ForegroundColor Green
        Write-Host "Order ID: $($content.order._id)" -ForegroundColor Green
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorContent = $_.Exception.Response | Get-Member -Name 'GetResponseStream' -ErrorAction SilentlyContinue
        
        if ($errorContent) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $responseBody = $reader.ReadToEnd() | ConvertFrom-Json
            
            Write-Host "❌ Статус: $statusCode" -ForegroundColor Yellow
            Write-Host "❌ Валидация сработала: $($responseBody.message)" -ForegroundColor Red
        }
    }
}

Write-Host "🧪 Тестирование валидации OrderController" -ForegroundColor Magenta

# 1. ТЕСТ: Отсутствие обязательных полей
Test-OrderValidation -TestName "Отсутствие всех полей" -RequestBody @{}

Test-OrderValidation -TestName "Отсутствие text" -RequestBody @{
    customerName = "Иванов Иван Иванович"
    phoneNumber = "79991234567"
}

Test-OrderValidation -TestName "Отсутствие customerName" -RequestBody @{
    text = "Гравировка на кольце"
    phoneNumber = "79991234567"
}

Test-OrderValidation -TestName "Отсутствие phoneNumber" -RequestBody @{
    text = "Гравировка на кольце"
    customerName = "Иванов Иван Иванович"
}

# 2. ТЕСТ: Валидация ФИО
Test-OrderValidation -TestName "ФИО с цифрами" -RequestBody @{
    text = "Гравировка на кольце"
    customerName = "Иванов123 Иван"
    phoneNumber = "79991234567"
}

Test-OrderValidation -TestName "ФИО со спецсимволами" -RequestBody @{
    text = "Гравировка на кольце"
    customerName = "Иванов@Иван#"
    phoneNumber = "79991234567"
}

Test-OrderValidation -TestName "ФИО слишком короткое" -RequestBody @{
    text = "Гравировка на кольце"
    customerName = "И"
    phoneNumber = "79991234567"
}

Test-OrderValidation -TestName "Пустое ФИО" -RequestBody @{
    text = "Гравировка на кольце"
    customerName = "   "
    phoneNumber = "79991234567"
}

# 3. ТЕСТ: Валидация номера телефона
Test-OrderValidation -TestName "Телефон с буквами" -RequestBody @{
    text = "Гравировка на кольце"
    customerName = "Иванов Иван Иванович"
    phoneNumber = "7999abc4567"
}

Test-OrderValidation -TestName "Телефон слишком короткий" -RequestBody @{
    text = "Гравировка на кольце"
    customerName = "Иванов Иван Иванович"
    phoneNumber = "123456789"
}

Test-OrderValidation -TestName "Телефон слишком длинный" -RequestBody @{
    text = "Гравировка на кольце"
    customerName = "Иванов Иван Иванович"
    phoneNumber = "1234567890123456"
}

Test-OrderValidation -TestName "Неверный российский номер (8)" -RequestBody @{
    text = "Гравировка на кольце"
    customerName = "Иванов Иван Иванович"
    phoneNumber = "81234567890"
}

Test-OrderValidation -TestName "Неверный российский номер (7)" -RequestBody @{
    text = "Гравировка на кольце"
    customerName = "Иванов Иван Иванович"
    phoneNumber = "71234567890"
}

Test-OrderValidation -TestName "Неверный 10-значный номер" -RequestBody @{
    text = "Гравировка на кольце"
    customerName = "Иванов Иван Иванович"
    phoneNumber = "1234567890"
}

# 4. ТЕСТ: Валидация текста заказа
Test-OrderValidation -TestName "Текст заказа слишком короткий" -RequestBody @{
    text = "123"
    customerName = "Иванов Иван Иванович"
    phoneNumber = "79991234567"
}

Test-OrderValidation -TestName "Пустой текст заказа" -RequestBody @{
    text = "    "
    customerName = "Иванов Иван Иванович"
    phoneNumber = "79991234567"
}

# 5. ТЕСТ: Валидные данные (должны пройти)
Write-Host "`n🟢 ТЕСТЫ ВАЛИДНЫХ ДАННЫХ:" -ForegroundColor Green

Test-OrderValidation -TestName "Валидный российский номер с 8" -RequestBody @{
    text = "Гравировка на кольце с инициалами"
    customerName = "Иванов Иван Иванович"
    phoneNumber = "89991234567"
}

Test-OrderValidation -TestName "Валидный российский номер с 7" -RequestBody @{
    text = "Гравировка на браслете"
    customerName = "Петрова Анна Сергеевна"
    phoneNumber = "79991234567"
}

Test-OrderValidation -TestName "Валидный 10-значный номер" -RequestBody @{
    text = "Гравировка на медали"
    customerName = "Сидоров Петр Александрович"
    phoneNumber = "9991234567"
}

Test-OrderValidation -TestName "Номер с форматированием" -RequestBody @{
    text = "Гравировка памятной надписи"
    customerName = "Козлова Мария Викторовна"
    phoneNumber = "+7 (999) 123-45-67"
}

Test-OrderValidation -TestName "ФИО с дефисом" -RequestBody @{
    text = "Гравировка на часах"
    customerName = "Иванова-Петрова Елена"
    phoneNumber = "79991234567"
}

Test-OrderValidation -TestName "Международный номер" -RequestBody @{
    text = "Гравировка на подарке"
    customerName = "Smith John"
    phoneNumber = "12345678901"
}

Write-Host "`n✅ Тестирование завершено!" -ForegroundColor Magenta
