var rules = new ruleJS();
rules.init();

describe('ruleJS', function () {
  it('should exists', function () {
    expect(rules).toBeDefined();
    expect(getType(rules)).toEqual('[object Object]');
  });

  it('should have `helper` object', function () {
    expect(rules.helper).toBeDefined();
    expect(getType(rules.helper)).toEqual('[object Object]');
  });

  it('should have `formulas` object', function () {
    expect(rules.formulas).toBeDefined();
    expect(getType(rules.formulas)).toEqual('[object Object]');
  });

  it('should have `parse()` method', function () {
    expect(rules.parse).toBeDefined();
    expect(getType(rules.parse)).toEqual('[object Function]');
  });

  describe('utils', function () {
    it('toNum() -> should convert A => 0, Z => 25, AA => 26', function () {
      expect(rules.utils.toNum('A')).toBe(0);
      expect(rules.utils.toNum('Z')).toBe(25);

      expect(rules.utils.toNum('AA')).toBe(26);
      expect(rules.utils.toNum('AB')).toBe(27);

      expect(rules.utils.toNum('$A')).toBe(0);
      expect(rules.utils.toNum('$A$')).toBe(0);
      expect(rules.utils.toNum('A$')).toBe(0);

      expect(rules.utils.toNum('$AB')).toBe(27);
      expect(rules.utils.toNum('$AB$')).toBe(27);
      expect(rules.utils.toNum('AB$')).toBe(27);
    });

    it('toChar() -> should convert 0 => A, 25 => Z, 26 => AA', function () {
      expect(rules.utils.toChar(0)).toBe('A');
      expect(rules.utils.toChar(25)).toBe('Z');
      expect(rules.utils.toChar(26)).toBe('AA');
      expect(rules.utils.toChar(27)).toBe('AB');
    });

    it('cellCoords() -> should return coordinates for cell ex. A1 -> {row: 0, col:0}', function () {
      expect(rules.utils.cellCoords('A1')).toEqual({row: 0, col: 0});
      expect(rules.utils.cellCoords('Z1')).toEqual({row: 0, col: 25});
      expect(rules.utils.cellCoords('AA1')).toEqual({row: 0, col: 26});
      expect(rules.utils.cellCoords('AB1')).toEqual({row: 0, col: 27});
    });

    it('translateCellCoords() -> should translate cell coordinates to cell ex. {row:0, col:0} -> A1', function () {
      expect(rules.utils.translateCellCoords({row: 0, col: 0})).toBe('A1');
      expect(rules.utils.translateCellCoords({row: 0, col: 25})).toBe('Z1');
      expect(rules.utils.translateCellCoords({row: 0, col: 26})).toBe('AA1');
      expect(rules.utils.translateCellCoords({row: 0, col: 27})).toBe('AB1');
    });

    it('changeColIndex() -> change column index ex. A1 -> B1', function() {
      expect(rules.utils.changeColIndex('A1', 1)).toBe('B1');
      expect(rules.utils.changeColIndex('A1', -1)).toBe('A1');
      expect(rules.utils.changeColIndex('AA1', 1)).toBe('AB1');

      expect(rules.utils.changeColIndex('Z1', 1)).toBe('AA1');
      expect(rules.utils.changeColIndex('AA1', -1)).toBe('Z1');

      expect(rules.utils.changeColIndex('A1', 2)).toBe('C1');
      expect(rules.utils.changeColIndex('AA1', 2)).toBe('AC1');

      expect(rules.utils.changeColIndex('C1', -2)).toBe('A1');
      expect(rules.utils.changeColIndex('AC1', -2)).toBe('AA1');
    });

    it('changeRowIndex() -> change row index ex. A1 -> A2', function () {
      expect(rules.utils.changeRowIndex('A1', 1)).toBe('A2');
      expect(rules.utils.changeRowIndex('A1', -1)).toBe('A1');
      expect(rules.utils.changeRowIndex('AA1', 1)).toBe('AA2');

      expect(rules.utils.changeRowIndex('Z1', 1)).toBe('Z2');
      expect(rules.utils.changeRowIndex('AA1', -1)).toBe('AA1');

      expect(rules.utils.changeRowIndex('A1', 2)).toBe('A3');
      expect(rules.utils.changeRowIndex('AA1', 2)).toBe('AA3');

      expect(rules.utils.changeRowIndex('C1', -2)).toBe('C1');
      expect(rules.utils.changeRowIndex('AC1', -2)).toBe('AC1');
    });

    it('getCellAlphaNum() -> get alpha and number of cell ex. A1 -> {alpha: A, num:1}', function () {
      expect(rules.utils.getCellAlphaNum('A1')).toEqual({alpha: 'A', num: 1});
      expect(rules.utils.getCellAlphaNum('AA1')).toEqual({alpha: 'AA', num: 1});
    });
  });
});

describe('parse()', function () {
  var parsed = null;

  beforeEach(function () {
    parsed = null;
  });

  describe('logical', function () {
    it('operator: =', function () {
      parsed = rules.parse('10=10');
      expect(parsed.result).toBe(true);

      parsed = rules.parse('10=-10');
      expect(parsed.result).toBe(false);
    });

    it('operator: >', function () {
      parsed = rules.parse('10>1');
      expect(parsed.result).toBe(true);

      parsed = rules.parse('-1>-2');
      expect(parsed.result).toBe(true);

      parsed = rules.parse('-2>-1');
      expect(parsed.result).toBe(false);
    });

    it('operator: <', function () {
      parsed = rules.parse('1<10');
      expect(parsed.result).toBe(true);

      parsed = rules.parse('-2<-1');
      expect(parsed.result).toBe(true);

      parsed = rules.parse('-1<-2');
      expect(parsed.result).toBe(false);
    });

    it('operator: >=', function () {
      parsed = rules.parse('10>=10');
      expect(parsed.result).toBe(true);

      parsed = rules.parse('11>=10');
      expect(parsed.result).toBe(true);

      parsed = rules.parse('10>=11');
      expect(parsed.result).toBe(false);
    });

    it('operator: <=', function () {
      parsed = rules.parse('10<=10');
      expect(parsed.result).toBe(true);

      parsed = rules.parse('12<=11');
      expect(parsed.result).toBe(false);
    });

    it('operator: <>', function () {
      parsed = rules.parse('10<>10');
      expect(parsed.result).toBe(false);

      parsed = rules.parse('12<>11');
      expect(parsed.result).toBe(true);
    });

    it('operator: NOT', function () {
      parsed = rules.parse('NOT(1)');
      expect(parsed.result).toBe(false);

      parsed = rules.parse('NOT(0)');
      expect(parsed.result).toBe(true);
    });
  });

  describe('math', function () {
    it('operator: +', function () {
      parsed = rules.parse('1+2');
      expect(parsed.result).toBe(3);

      parsed = rules.parse('SUM(1,2) + SUM(2,3)');
      expect(parsed.result).toBe(8);
    });

    it('operator: -', function () {
      parsed = rules.parse('2-1');
      expect(parsed.result).toBe(1);

      parsed = rules.parse('SUM(2,3) - SUM(1,2)');
      expect(parsed.result).toBe(2);
    });

    it('operator: /', function () {
      parsed = rules.parse('2/1');
      expect(parsed.result).toBe(2);

      parsed = rules.parse('2/0');
      expect(parsed.result).toBe(null);
      expect(parsed.error).toBe('#DIV/0!');
    });
  });

  it('ABS', function () {
    parsed = rules.parse('ABS(-1)');
    expect(parsed.result).toBe(1);

    parsed = rules.parse('ABS(1)');
    expect(parsed.result).toBe(1);
  });

  it('ACCRINT', function () {
    parsed = rules.parse("ACCRINT('01/01/2011', '02/01/2011', '07/01/2014', 0.1, 1000, 1, 0)");
    expect(parsed.result).toBe(350);
  });

  it('ACOS', function () {
    parsed = rules.parse('ROUND(ACOS(-1),5)');
    expect(parsed.result).toBe(3.14159);
  });

  it('ACOSH', function () {
    parsed = rules.parse('ROUND(ACOSH(10),5)');
    expect(parsed.result).toBe(2.99322);
  });

  it('ACOTH', function () {
    parsed = rules.parse('ROUND(ACOTH(6),5)');
    expect(parsed.result).toBe(0.16824);
  });

  it('AND', function () {
    parsed = rules.parse('AND(true, false, true)');
    expect(parsed.result).toBe(false);
  });

  it('ARABIC', function () {
    parsed = rules.parse("ARABIC('MCMXII')");
    expect(parsed.result).toBe(1912);
  });

  it('ASIN', function () {
    parsed = rules.parse("ROUND(ASIN(-0.5),5)");
    expect(parsed.result).toBe(-0.5236);
  });

  it('ASINH', function () {
    parsed = rules.parse("ROUND(ASINH(-2.5),5)");
    expect(parsed.result).toBe(-1.64723);
  });

  it('ATAN', function () {
    parsed = rules.parse("ROUND(ATAN(1),5)");
    expect(parsed.result).toBe(0.7854);
  });

  it('ATAN2', function () {
    parsed = rules.parse("ROUND(ATAN2(-1, -1),5)");
    expect(parsed.result).toBe(-2.35619);
  });

  it('ATANH', function () {
    parsed = rules.parse("ROUND(ATANH(-0.1),5)");
    expect(parsed.result).toBe(-0.10034);
  });

  it('AVEDEV', function () {
    parsed = rules.parse('AVEDEV([2,4], [8,16])');
    expect(parsed.result).toBe(4.5);
  });

  it('AVERAGE', function () {
    parsed = rules.parse("AVERAGE([2,4], [8,16])");
    expect(parsed.result).toBe(7.5);
  });

  it('AVERAGEA', function () {
    parsed = rules.parse("AVERAGEA([2,4], [8,16])");
    expect(parsed.result).toBe(7.5);
  });

  it('AVERAGEIF', function () {
    parsed = rules.parse("AVERAGEIF([2,4,8,16], '>5', [1, 2, 3, 4])");
    expect(parsed.result).toBe(3.5);
  });

  it('BASE', function () {
    parsed = rules.parse("BASE(15, 2, 10)");
    expect(parsed.result).toBe("0000001111");
  });

  it('BESSELI', function () {
    parsed = rules.parse("ROUND(BESSELI(1, 2),5)");
    expect(parsed.result).toBe(0.13575);
  });

  it('BESSELJ', function () {
    parsed = rules.parse("ROUND(BESSELJ(1, 2),5)");
    expect(parsed.result).toBe(0.1149);
  });

  it('BESSELK', function () {
    parsed = rules.parse("ROUND(BESSELK(1, 2),5)");
    expect(parsed.result).toBe(1.62484);
  });

  it('BESSELY', function () {
    parsed = rules.parse("ROUND(BESSELY(1, 2),5)");
    expect(parsed.result).toBe(-1.65068);
  });

  it('BETADIST', function () {
    parsed = rules.parse("ROUND(BETADIST(2, 8, 10, true, 1, 3),5)");
    expect(parsed.result).toBe(0.68547);
  });

  it('BETAINV', function () {
    parsed = rules.parse("ROUND(BETAINV(0.6854705810117458, 8, 10, 1, 3),1)");
    expect(parsed.result).toBe(2);
  });

  it('BIN2DEC', function () {
    parsed = rules.parse("BIN2DEC(101010)");
    expect(parsed.result).toBe(42);
  });

  it('BIN2HEX', function () {
    parsed = rules.parse("BIN2HEX(101010)");
    expect(parsed.result).toBe('2a');
  });

  it('BIN2OCT', function () {
    parsed = rules.parse("BIN2OCT(101010)");
    expect(parsed.result).toBe('52');
  });

  it('BINOMDIST', function () {
    parsed = rules.parse("ROUND(BINOMDIST(6, 10, 0.5, false), 5)");
    expect(parsed.result).toBe(0.20508);
  });
  it('BINOMDISTRANGE', function () {
    parsed = rules.parse("ROUND(BINOMDISTRANGE(60, 0.75, 45, 50),5)");
    expect(parsed.result).toBe(0.52363);
  });

  it('BINOMINV', function () {
    parsed = rules.parse("BINOMINV(6, 0.5, 0.75)");
    expect(parsed.result).toBe(4);
  });

  it('BITAND', function () {
    parsed = rules.parse("BITAND(42, 24)");
    expect(parsed.result).toBe(8);
  });

  it('BITLSHIFT', function () {
    parsed = rules.parse("BITLSHIFT(42, 24)");
    expect(parsed.result).toBe(704643072);
  });

  it('BITOR', function () {
    parsed = rules.parse("BITOR(42, 24)");
    expect(parsed.result).toBe(58);
  });

  it('BITRSHIFT', function () {
    parsed = rules.parse("BITRSHIFT(42, 2)");
    expect(parsed.result).toBe(10);
  });

  it('BITXOR', function () {
    parsed = rules.parse("BITXOR(42, 24)");
    expect(parsed.result).toBe(50);
  });

  it('CEILING', function () {
    parsed = rules.parse("CEILING(-5.5, 2, -1)");
    expect(parsed.result).toBe(-6);
  });

  it('CEILINGMATH', function () {
    parsed = rules.parse("CEILINGMATH(-5.5, 2, -1)");
    expect(parsed.result).toBe(-6);
  });

  it('CEILINGPRECISE', function () {
    parsed = rules.parse("CEILINGPRECISE(-4.1, -2)");
    expect(parsed.result).toBe(-4);
  });

  it('CHAR', function () {
    parsed = rules.parse("CHAR(65)");
    expect(parsed.result).toBe("A");
  });

  it('CHISQDIST', function () {
    parsed = rules.parse("ROUND(CHISQDIST(0.5, 1, true),5)");
    expect(parsed.result).toBe(0.5205);
  });

  it('CHISQINV', function () {
    parsed = rules.parse("ROUND(CHISQINV(0.6, 2, true),5)");
    expect(parsed.result).toBe(1.83258);
  });

  it('CODE', function () {
    parsed = rules.parse("CODE('A')");
    expect(parsed.result).toBe(65);
  });

  it('COMBIN', function () {
    parsed = rules.parse("COMBIN(8, 2)");
    expect(parsed.result).toBe(28);
  });

  it('COMBINA', function () {
    parsed = rules.parse("COMBINA(4, 3)");
    expect(parsed.result).toBe(20);
  });

  it('COMPLEX', function () {
    parsed = rules.parse("COMPLEX(3, 4)");
    expect(parsed.result).toBe("3+4i");
  });

  it('CONCATENATE', function () {
    parsed = rules.parse("CONCATENATE('Andreas', ' ', 'Hauser')");
    expect(parsed.result).toBe("Andreas Hauser");
  });

  it('CONFIDENCENORM', function () {
    parsed = rules.parse("ROUND(CONFIDENCENORM(0.05, 2.5, 50),5)");
    expect(parsed.result).toBe(0.69295);
  });

  it('CONFIDENCET', function () {
    parsed = rules.parse("ROUND(CONFIDENCET(0.05, 1, 50), 5)");
    expect(parsed.result).toBe(0.2842);
  });

  it('CONVERT', function () {
    parsed = rules.parse("CONVERT(64, 'kibyte', 'bit')");
    expect(parsed.result).toBe(524288);
  });

  it('CORREL', function () {
    parsed = rules.parse("ROUND(CORREL([3,2,4,5,6], [9,7,12,15,17]),5)");
    expect(parsed.result).toBe(0.99705);
  });

  it('COS', function () {
    parsed = rules.parse("ROUND(COS(1),5)");
    expect(parsed.result).toBe(0.5403);
  });

  it('COSH', function () {
    parsed = rules.parse("ROUND(COSH(1),5)");
    expect(parsed.result).toBe(1.54308);
  });

  it('COT', function () {
    parsed = rules.parse("ROUND(COT(30),5)");
    expect(parsed.result).toBe(-0.15612);
  });

  it('COTH', function () {
    parsed = rules.parse("ROUND(COTH(2),5)");
    expect(parsed.result).toBe(1.03731);
  });

  it('COUNT', function () {
    parsed = rules.parse("COUNT([1,2], [3,4])");
    expect(parsed.result).toBe(4);
  });

  it('COUNTA', function () {
    parsed = rules.parse("COUNTA([1, null, 3, 'a', '', 'c'])");
    expect(parsed.result).toBe(4);
  });

  it('COUNTBLANK', function () {
    parsed = rules.parse("COUNTBLANK([1, null, 3, 'a', '', 'c'])");
    expect(parsed.result).toBe(2);
  });

  it('COUNTIF', function () {
    parsed = rules.parse("COUNTIF(['Caen', 'Melbourne', 'Palo Alto', 'Singapore'], 'a')");
    expect(parsed.result).toBe(3);
  });

  it('COUNTIFS', function () {
    parsed = rules.parse("COUNTIFS([2,4,8,16], [1,2,3,4], '>=2', [1,2,4,8], '<=4')");
    expect(parsed.result).toBe(2);
  });

  it('COUNTIN', function () {
    parsed = rules.parse("COUNTIN([1,3,1],1)");
    expect(parsed.result).toBe(2);
  });

  it('COUNTUNIQUE', function () {
    parsed = rules.parse("COUNTUNIQUE([1,1,2,2,3,3])");
    expect(parsed.result).toBe(3);
  });

  it('COVARIANCEP', function () {
    parsed = rules.parse("COVARIANCEP([3,2,4,5,6], [9,7,12,15,17])");
    expect(parsed.result).toBe(5.2);
  });

  it('COVARIANCES', function () {
    parsed = rules.parse("ROUND(COVARIANCES([2,4,8], [5,11,12]),5)");
    expect(parsed.result).toBe(9.66667);
  });

  it('CSC', function () {
    parsed = rules.parse("ROUND(CSC(15),5)");
    expect(parsed.result).toBe(1.53778);
  });

  it('CSCH', function () {
    parsed = rules.parse("ROUND(CSCH(1.5),5)");
    expect(parsed.result).toBe(0.46964);
  });

  it('CUMIPMT', function () {
    parsed = rules.parse("ROUND(CUMIPMT('0.1/12', '30*12', 100000, 13, 24, 0),5)");
    expect(parsed.result).toBe(-9916.77251);
  });

  it('CUMPRINC', function () {
    parsed = rules.parse("ROUND(CUMPRINC('0.1/12', '30*12', 100000, 13, 24, 0),5)");
    expect(parsed.result).toBe(-614.08633);
  });

  it('DATE', function () {
    parsed = rules.parse("DATE(2008, 7, 8)");
    expect(parsed.result.toString()).toBe("Tue Jul 08 2008 00:00:00 GMT+0200 (CEST)");
  });

  it('DATEVALUE', function () {
    parsed = rules.parse("DATEVALUE('8/22/2011')");
    expect(parsed.result).toBe(40777);
  });

  it('DAY', function () {
    parsed = rules.parse("DAY('15-Apr-11')");
    expect(parsed.result).toBe(15);
  });

  it('DAYS', function () {
    parsed = rules.parse("DAYS('3/15/11', '2/1/11')");
    expect(parsed.result).toBe(42);
  });

  it('DAYS360', function () {
    parsed = rules.parse("DAYS360('1-Jan-11', '31-Dec-11')");
    expect(parsed.result).toBe(360);
  });

  it('DB', function () {
    parsed = rules.parse("DB(1000000, 100000, 6, 1, 6)");
    expect(parsed.result).toBe(159500);
  });

  it('DDB', function () {
    parsed = rules.parse("DDB(1000000, 100000, 6, 1, 1.5)");
    expect(parsed.result).toBe(250000);
  });

  it('DEC2BIN', function () {
    parsed = rules.parse("DEC2BIN(42)");
    expect(parsed.result).toBe("101010");
  });

  it('DEC2HEX', function () {
    parsed = rules.parse("DEC2HEX(42)");
    expect(parsed.result).toBe("2a");
  })

  it('DEC2OCT', function () {
    parsed = rules.parse("DEC2OCT(42)");
    expect(parsed.result).toBe("52");
  });

  it('DECIMAL', function () {
    parsed = rules.parse("DECIMAL('FF', 16)");
    expect(parsed.result).toBe(255);
  });

  it('DEGREES', function () {
    parsed = rules.parse("DEGREES(PI())");
    expect(parsed.result).toBe(180);
  });

  it('DELTA', function () {
    parsed = rules.parse("DELTA(42, 42)");
    expect(parsed.result).toBe(1);
  });

  it('DEVSQ', function () {
    parsed = rules.parse("DEVSQ([2,4,8,16])");
    expect(parsed.result).toBe(115);
  });

  it('DOLLAR', function () {
    parsed = rules.parse("DOLLAR(-0.123, 4)");
    expect(parsed.result).toBe("($0.1230)");
  });

  it('DOLLARDE', function () {
    parsed = rules.parse("DOLLARDE(1.1, 16)");
    expect(parsed.result).toBe(1.625);
  });

  it('DOLLARFR', function () {
    parsed = rules.parse("DOLLARFR(1.625, 16)");
    expect(parsed.result).toBe(1.1);
  });

  it('E', function () {
    parsed = rules.parse("ROUND(E(),5)");
    expect(parsed.result).toBe(2.71828);
  });

  it('EDATE', function () {
    parsed = rules.parse("EDATE('1/15/11', -1)");
    expect(parsed.result.toString()).toBe("Wed Dec 15 2010 00:00:00 GMT+0100 (CET)");
  });

  it('EFFECT', function () {
    parsed = rules.parse("ROUND(EFFECT(0.1, 4),5)");
    expect(parsed.result).toBe(0.10381);
  });

  it('EOMONTH', function () {
    parsed = rules.parse("EOMONTH('1/1/11', -3)");
    expect(parsed.result.toString()).toBe("Sun Oct 31 2010 00:00:00 GMT+0200 (CEST)");
  });

  it('ERF', function () {
    parsed = rules.parse("ROUND(ERF(1),5)");
    expect(parsed.result).toBe(0.8427);
  });

  it('ERFC', function () {
    parsed = rules.parse("ROUND(ERFC(1),5)");
    expect(parsed.result).toBe(0.1573);
  });

  it('EVEN', function () {
    parsed = rules.parse("EVEN(-1)");
    expect(parsed.result).toBe(-2);
  });

  it('EXACT', function () {
    parsed = rules.parse("EXACT('Word', 'Word')");
    expect(parsed.result).toBe(true);

    parsed = rules.parse("EXACT('Word', 'word')");
    expect(parsed.result).toBe(false);
  });

  it('EXPONDIST', function () {
    parsed = rules.parse("ROUND(EXPONDIST(0.2, 10, true),5)");
    expect(parsed.result).toBe(0.86466);
  });

  it('FALSE', function () {
    parsed = rules.parse("FALSE()");
    expect(parsed.result).toBe(false);
  });

  it('FDIST', function () {
    parsed = rules.parse("ROUND(FDIST(15.2069, 6, 4, false),5)");
    expect(parsed.result).toBe(0.00122);
  });

  it('FINV', function () {
    parsed = rules.parse("ROUND(FINV(0.01, 6, 4),5)");
    expect(parsed.result).toBe(15.20686);
  });

  it('FISHER', function () {
    parsed = rules.parse("ROUND(FISHER(0.75),5)");
    expect(parsed.result).toBe(0.97296);
  });

  it('FISHERINV', function () {
    parsed = rules.parse("FISHERINV(0.9729550745276566)");
    expect(parsed.result).toBe(0.75);
  });

  it('INT', function () {
    parsed = rules.parse("INT(-8.9)");
    expect(parsed.result).toBe(-9);
  });

  it('ISEVEN', function () {
    parsed = rules.parse("ISEVEN(-2.5)");
    expect(parsed.result).toBe(true);
  });

  it('ISODD', function () {
    parsed = rules.parse("ISODD(-2.5)");
    expect(parsed.result).toBe(false);
  });

  it('LN', function () {
    parsed = rules.parse("ROUND(LN(86),5)");
    expect(parsed.result).toBe(4.45435);
  });

  it('LOG', function () {
    parsed = rules.parse("LOG(8, 2)");
    expect(parsed.result).toBe(3);
  });

  it('LOG10', function () {
    parsed = rules.parse("LOG10(100000)");
    expect(parsed.result).toBe(5);
  });

  it('MAX', function () {
    parsed = rules.parse("MAX([0.1,0.2], [0.4,0.8], [true, false])");
    expect(parsed.result).toBe(0.8);
  });

  it('MAXA', function () {
    parsed = rules.parse("MAXA([0.1,0.2], [0.4,0.8], [true, false])");
    expect(parsed.result).toBe(1);
  });

  it('MEDIAN', function () {
    parsed = rules.parse("MEDIAN([1,2,3], [4,5,6])");
    expect(parsed.result).toBe(3.5);
  });

  it('MIN', function () {
    parsed = rules.parse("MIN([0.1,0.2], [0.4,0.8], [true, false])");
    expect(parsed.result).toBe(0.1);
  });

  it('MINA', function () {
    parsed = rules.parse("MINA([0.1,0.2], [0.4,0.8], [true, false])");
    expect(parsed.result).toBe(0);
  });

  it('MOD', function () {
    parsed = rules.parse("MOD(3, -2)");
    expect(parsed.result).toBe(-1);
  });

  it('NOT', function () {
    parsed = rules.parse("NOT(FALSE())");
    expect(parsed.result).toBe(true);
  });

  it('ODD', function () {
    parsed = rules.parse("ODD(-1.5)");
    expect(parsed.result).toBe(-3);
  });

  it('OR', function () {
    parsed = rules.parse('OR(true, false, true)');
    expect(parsed.result).toBe(true);
  });

  it('PI', function () {
    parsed = rules.parse("ROUND(PI(),5)");
    expect(parsed.result).toBe(3.14159);
  });

  it('POWER', function () {
    parsed = rules.parse("POWER(5, 2)");
    expect(parsed.result).toBe(25);
  });

  it('ROUND', function () {
    parsed = rules.parse("ROUND(626.3, 2)");
    expect(parsed.result).toBe(626.3);

    parsed = rules.parse("ROUND(626.3, -2)");
    expect(parsed.result).toBe(600);
  });

  it('ROUNDOWN', function () {
    parsed = rules.parse("ROUNDDOWN(-3.14159, 2)");
    expect(parsed.result).toBe(-3.14);
  });

  it('ROUNDUP', function () {
    parsed = rules.parse("ROUNDUP(-3.14159, 2)");
    expect(parsed.result).toBe(-3.15);
  });

  it('SIN', function () {
    parsed = rules.parse("ROUND(SIN(1),5)");
    expect(parsed.result).toBe(0.84147);
  });

  it('SINH', function () {
    parsed = rules.parse("ROUND(SINH(1),5)");
    expect(parsed.result).toBe(1.1752);
  });

  it('SPLIT', function () {
    parsed = rules.parse("SPLIT('A,B,C', ',')");
    expect(parsed.result.join()).toBe('A,B,C');
  });

  it('SQRT', function () {
    parsed = rules.parse("SQRT(16)");
    expect(parsed.result).toBe(4);
  });

  it('SQRTPI', function () {
    parsed = rules.parse("ROUND(SQRTPI(2),5)");
    expect(parsed.result).toBe(2.50663);
  });

  it('SUM', function () {
    parsed = rules.parse("SUM(-5, 15, 32, 'Hello World!')");
    expect(parsed.result).toBe(42);
  });

  it('SUMIF', function () {
    parsed = rules.parse("SUMIF([2,4,8,16], '>5')");
    expect(parsed.result).toBe(24);
  });

  it('SUMIFS', function () {
    parsed = rules.parse("SUMIFS([2,4,8,16], [1,2,3,4], '>=2', [1,2,4,8], '<=4')");
    expect(parsed.result).toBe(12);
  });

  it('SUMPRODUCT', function () {
    parsed = rules.parse("SUMPRODUCT([[1,2],[3,4]], [[1,0],[0,1]])");
    expect(parsed.result).toBe(5);
  });

  it('SUMSQ', function () {
    parsed = rules.parse("SUMSQ(3, 4)");
    expect(parsed.result).toBe(25);
  });

  it('SUMX2MY2', function () {
    parsed = rules.parse("SUMX2MY2([1,2], [3,4])");
    expect(parsed.result).toBe(-20);
  });

  it('SUMX2PY2', function () {
    parsed = rules.parse("SUMX2PY2([1,2], [3,4])");
    expect(parsed.result).toBe(30);
  });

  it('SUMXMY2', function () {
    parsed = rules.parse("SUMXMY2([1,2], [3,4])");
    expect(parsed.result).toBe(8);
  });

  it('TAN', function () {
    parsed = rules.parse("ROUND(TAN(1),5)");
    expect(parsed.result).toBe(1.55741);
  });

  it('TANH', function () {
    parsed = rules.parse("ROUND(TANH(-2),5)");
    expect(parsed.result).toBe(-0.96403);
  });

  it('TRUNCATE', function () {
    parsed = rules.parse("TRUNC(-8.9)");
    expect(parsed.result).toBe(-8);
  });

  it('TRUE', function () {
    parsed = rules.parse("TRUE()");
    expect(parsed.result).toBe(true);
  });

  it('XOR', function () {
    parsed = rules.parse("XOR(true, false, true)");
    expect(parsed.result).toBe(false);
  });
});
