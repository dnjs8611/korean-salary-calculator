document.addEventListener('DOMContentLoaded', () => {
    const salaryInput = document.getElementById('salary-input');
    const calcTypeAnnual = document.getElementById('calc-type-annual');
    const calcTypeMonthly = document.getElementById('calc-type-monthly');
    const inputLabel = document.getElementById('input-label');
    const inputUnit = document.getElementById('input-unit');
    const nonTaxableInput = document.getElementById('non-taxable');
    const dependentsInput = document.getElementById('dependents');
    const childrenInput = document.getElementById('children');
    const calculateBtn = document.getElementById('calculate-btn');
    
    const resultSection = document.getElementById('result-section');
    const netIncomeValue = document.getElementById('net-income-value');
    const totalTaxValue = document.getElementById('total-tax-value');
    const pensionValue = document.getElementById('pension-value');
    const healthValue = document.getElementById('health-value');
    const careValue = document.getElementById('care-value');
    const employmentValue = document.getElementById('employment-value');
    const incomeTaxValue = document.getElementById('income-tax-value');
    const localTaxValue = document.getElementById('local-tax-value');
    
    const netIncomeBar = document.getElementById('net-income-bar');
    const taxBar = document.getElementById('tax-bar');
    const netPercent = document.getElementById('net-percent');
    const taxPercent = document.getElementById('tax-percent');

    let currentType = 'annual'; // 'annual' or 'monthly'

    // Format number with commas
    const formatNumber = (num) => {
        return Math.round(num).toLocaleString('ko-KR');
    };

    // Remove commas from string
    const parseNumber = (str) => {
        return parseFloat(str.replace(/,/g, '')) || 0;
    };

    // Input event listener for formatting commas
    salaryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^0-9.]/g, '');
        if (value) {
            // Allow decimal for precision if needed, but usually integers for KRW
            const parts = value.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            e.target.value = parts.join('.');
        }
    });

    // Toggle between Annual and Monthly
    calcTypeAnnual.addEventListener('click', () => {
        currentType = 'annual';
        calcTypeAnnual.classList.add('active');
        calcTypeMonthly.classList.remove('active');
        inputLabel.textContent = '연봉 입력';
        inputUnit.textContent = '만원';
        salaryInput.placeholder = '예: 4,000';
        // Clear previous result
        resultSection.classList.add('hidden');
    });

    calcTypeMonthly.addEventListener('click', () => {
        currentType = 'monthly';
        calcTypeMonthly.classList.add('active');
        calcTypeAnnual.classList.remove('active');
        inputLabel.textContent = '월급 입력';
        inputUnit.textContent = '만원';
        salaryInput.placeholder = '예: 330';
        // Clear previous result
        resultSection.classList.add('hidden');
    });

    // Calculation Logic
    calculateBtn.addEventListener('click', () => {
        const rawSalary = parseNumber(salaryInput.value);
        if (rawSalary <= 0) {
            alert('금액을 입력해 주세요.');
            return;
        }

        const nonTaxable = parseNumber(nonTaxableInput.value) * 10000;
        const dependents = parseInt(dependentsInput.value) || 1;
        const children = parseInt(childrenInput.value) || 0;

        let monthlyGross = 0;
        if (currentType === 'annual') {
            monthlyGross = (rawSalary * 10000) / 12;
        } else {
            monthlyGross = rawSalary * 10000;
        }

        const taxableMonthly = Math.max(0, monthlyGross - nonTaxable);

        // 1. 국민연금 (4.5%)
        // 2024 기준 기준소득월액 하한액 39만원, 상한액 617만원
        const pensionBase = Math.min(Math.max(taxableMonthly, 390000), 6170000);
        const pension = Math.floor((pensionBase * 0.045) / 10) * 10;

        // 2. 건강보험 (3.545%)
        const health = Math.floor((taxableMonthly * 0.03545) / 10) * 10;

        // 3. 장기요양보험 (건강보험료의 12.95%)
        const care = Math.floor((health * 0.1295) / 10) * 10;

        // 4. 고용보험 (0.9%)
        const employment = Math.floor((taxableMonthly * 0.009) / 10) * 10;

        // 5. 소득세 (간이세액표 대용 근사식)
        const annualTaxable = taxableMonthly * 12;
        
        // 근로소득공제
        let earnedIncomeDeduction = 0;
        if (annualTaxable <= 5000000) {
            earnedIncomeDeduction = annualTaxable * 0.7;
        } else if (annualTaxable <= 15000000) {
            earnedIncomeDeduction = 3500000 + (annualTaxable - 5000000) * 0.4;
        } else if (annualTaxable <= 45000000) {
            earnedIncomeDeduction = 7500000 + (annualTaxable - 15000000) * 0.15;
        } else if (annualTaxable <= 100000000) {
            earnedIncomeDeduction = 12000000 + (annualTaxable - 45000000) * 0.05;
        } else {
            earnedIncomeDeduction = 14750000 + (annualTaxable - 100000000) * 0.02;
        }

        const incomeAfterDeduction = Math.max(0, annualTaxable - earnedIncomeDeduction);
        
        // 인적공제 (본인 및 부양가족 1인당 150만원)
        const personalDeduction = dependents * 1500000;
        // 자녀세액공제는 세액에서 빼야 하지만, 여기선 소득공제에 단순 합산 (근사치)
        const childDeduction = children * 1500000; 
        
        const taxBase = Math.max(0, incomeAfterDeduction - personalDeduction - childDeduction);

        // 과세표준 세율 (2026 기준)
        let annualIncomeTax = 0;
        if (taxBase <= 14000000) {
            annualIncomeTax = taxBase * 0.06;
        } else if (taxBase <= 50000000) {
            annualIncomeTax = 840000 + (taxBase - 14000000) * 0.15;
        } else if (taxBase <= 88000000) {
            annualIncomeTax = 6240000 + (taxBase - 50000000) * 0.24;
        } else if (taxBase <= 150000000) {
            annualIncomeTax = 15360000 + (taxBase - 88000000) * 0.35;
        } else if (taxBase <= 300000000) {
            annualIncomeTax = 37060000 + (taxBase - 150000000) * 0.38;
        } else if (taxBase <= 500000000) {
            annualIncomeTax = 94060000 + (taxBase - 300000000) * 0.40;
        } else if (taxBase <= 1000000000) {
            annualIncomeTax = 174060000 + (taxBase - 500000000) * 0.42;
        } else {
            annualIncomeTax = 384060000 + (taxBase - 1000000000) * 0.45;
        }

        const monthlyIncomeTax = Math.floor((annualIncomeTax / 12) / 10) * 10;

        // 6. 지방소득세 (소득세의 10%)
        const localTax = Math.floor((monthlyIncomeTax * 0.1) / 10) * 10;

        // 합계
        const totalDeductions = pension + health + care + employment + monthlyIncomeTax + localTax;
        const netIncome = Math.max(0, monthlyGross - totalDeductions);

        // UI Update
        netIncomeValue.textContent = formatNumber(netIncome);
        totalTaxValue.textContent = formatNumber(totalDeductions);
        
        pensionValue.textContent = formatNumber(pension) + '원';
        healthValue.textContent = formatNumber(health) + '원';
        careValue.textContent = formatNumber(care) + '원';
        employmentValue.textContent = formatNumber(employment) + '원';
        incomeTaxValue.textContent = formatNumber(monthlyIncomeTax) + '원';
        localTaxValue.textContent = formatNumber(localTax) + '원';

        // Chart Update
        const totalPercent = 100;
        const netRatio = (netIncome / monthlyGross) * 100;
        const taxRatio = 100 - netRatio;

        netIncomeBar.style.width = `${netRatio}%`;
        taxBar.style.width = `${taxRatio}%`;
        
        netPercent.textContent = Math.round(netRatio);
        taxPercent.textContent = Math.round(taxRatio);

        // Show result card
        resultSection.classList.remove('hidden');
        
        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth' });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching Logic
    const mainTabBtns = document.querySelectorAll('.main-tab-btn');
    const calcSections = document.querySelectorAll('.calc-section');

    mainTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all tabs and sections
            mainTabBtns.forEach(b => b.classList.remove('active'));
            calcSections.forEach(s => s.classList.remove('active'));
            
            // Add active to clicked tab and corresponding section
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    // Holiday Pay Elements
    const hourlyWageInput = document.getElementById('hourly-wage');
    const weeklyHoursInput = document.getElementById('weekly-hours');
    const calcHolidayBtn = document.getElementById('calculate-holiday-btn');
    const holidayResultSection = document.getElementById('holiday-result-section');

    const weeklyTotalValue = document.getElementById('weekly-total-value');
    const basePayValue = document.getElementById('base-pay-value');
    const holidayPayValue = document.getElementById('holiday-pay-value');
    const monthlyTotalValue = document.getElementById('monthly-total-value');

    const basePayBar = document.getElementById('base-pay-bar');
    const holidayPayBar = document.getElementById('holiday-pay-bar');
    const basePercent = document.getElementById('base-percent');
    const holidayPercent = document.getElementById('holiday-percent');

    // Input formatting for hourly wage
    if (hourlyWageInput) {
        hourlyWageInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9]/g, '');
            if (value) {
                e.target.value = parseInt(value).toLocaleString('ko-KR');
            }
        });
    }

    // Remove commas from string function
    const parseNum = (str) => {
        return parseFloat(str.replace(/,/g, '')) || 0;
    };
    
    // Format number with commas function
    const formatNum = (num) => {
        return Math.round(num).toLocaleString('ko-KR');
    };

    // Calculate Holiday Pay
    if (calcHolidayBtn) {
        calcHolidayBtn.addEventListener('click', () => {
            const hourlyWage = parseNum(hourlyWageInput.value);
            const weeklyHours = parseFloat(weeklyHoursInput.value) || 0;

            if (hourlyWage <= 0) {
                alert('시급을 올바르게 입력해 주세요.');
                return;
            }
            if (weeklyHours <= 0) {
                alert('근무시간을 입력해 주세요.');
                return;
            }

            // 기본급
            const basePay = hourlyWage * weeklyHours;
            
            // 주휴수당
            let holidayPay = 0;
            if (weeklyHours >= 15) {
                // 최대 40시간까지만 주휴수당 산정
                const calcHours = Math.min(weeklyHours, 40);
                holidayPay = (calcHours / 40) * 8 * hourlyWage;
            }

            const weeklyTotal = basePay + holidayPay;
            // 월급 (주급 * 4.345주)
            const monthlyTotal = Math.round(weeklyTotal * 4.345);

            // UI Update
            weeklyTotalValue.textContent = formatNum(weeklyTotal);
            basePayValue.textContent = formatNum(basePay) + '원';
            holidayPayValue.textContent = formatNum(holidayPay) + '원';
            monthlyTotalValue.textContent = formatNum(monthlyTotal);

            // Chart Update
            if (weeklyTotal > 0) {
                const baseRatio = (basePay / weeklyTotal) * 100;
                const holidayRatio = (holidayPay / weeklyTotal) * 100;

                basePayBar.style.width = `${baseRatio}%`;
                holidayPayBar.style.width = `${holidayRatio}%`;
                
                basePercent.textContent = Math.round(baseRatio);
                holidayPercent.textContent = Math.round(holidayRatio);
            } else {
                basePayBar.style.width = '100%';
                holidayPayBar.style.width = '0%';
            }

            holidayResultSection.classList.remove('hidden');
            holidayResultSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
});
