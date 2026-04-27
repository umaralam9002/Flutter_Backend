const escapeCsv = (value) => {
	if (value === null || value === undefined) return '';
	const str = String(value);
	if (/[",\n\r]/.test(str)) {
		return '"' + str.replace(/"/g, '""') + '"';
	}
	return str;
};

function arrayToCsv(headers, rows) {
	const headerLine = headers.map(escapeCsv).join(',');
	const lines = rows.map(row => headers.map(h => escapeCsv(row[h] ?? '')).join(','));
	return [headerLine, ...lines].join('\r\n');
}

module.exports = {
	arrayToCsv
};
