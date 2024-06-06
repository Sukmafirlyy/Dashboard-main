import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { TableVirtuoso } from 'react-virtuoso';

const sample = [
    ['Frozen yoghurt', 159, 6.0, 24, 4.0],
    ['Ice cream sandwich', 237, 9.0, 37, 4.3],
    ['Eclair', 262, 16.0, 24, 6.0],
    ['Cupcake', 305, 3.7, 67, 4.3],
    ['Gingerbread', 356, 16.0, 49, 3.9],
];

function createData(id, dessert, calories, fat, carbs, protein) {
    return { id, dessert, calories, fat, carbs, protein };
}

const columns = [
    {
        width: 120,
        label: 'Time',
        dataKey: 'time',
    },
    {
        width: 120,
        label: 'Speed',
        dataKey: 'speed',
        numeric: true,
    },
    {
        width: 120,
        label: 'Distance',
        dataKey: 'distance',
        numeric: true,
    },
];

const rows = Array.from({ length: 200 }, (_, index) => {
    const randomSelection = sample[Math.floor(Math.random() * sample.length)];
    return createData(index, ...randomSelection);
});

const VirtuosoTableComponents = {
    Scroller: React.forwardRef((props, ref) => (
        <TableContainer component={Paper} {...props} ref={ref} sx={{ width: '100%' }} />
    )),
    Table: (props) => (
        <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
    ),
    TableHead,
    TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
    TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
};

function fixedHeaderContent() {
    return (
        <TableRow>
            {columns.map((column, index) => (
                <TableCell
                    key={column.dataKey}
                    variant="head"
                    align="center"  /*{column.numeric || false ? 'right' : 'left'}*/
                    style={{
                        width: column.width,
                        borderBottom: '1px solid #ddd', // Menambahkan garis bawah
                        borderRight: index !== columns.length - 1 ? '1px solid #ddd' : 'none' // Menambahkan garis kanan kecuali untuk kolom terakhir
                    }}
                    sx={{
                        backgroundColor: 'background.paper',
                    }}
                >
                    {column.label}
                </TableCell>
            ))}
        </TableRow>
    );
}

function rowContent(_index, row) {
    return (
        <React.Fragment>
            {columns.map((column, index) => (
                <TableCell
                    key={column.dataKey}
                    align={column.numeric || false ? 'right' : 'left'}
                    style={{
                        borderBottom: '1px solid #ddd', // Menambahkan garis bawah
                        borderRight: index !== columns.length - 1 ? '1px solid #ddd' : 'none' // Menambahkan garis kanan kecuali untuk kolom terakhir
                    }}
                >
                    {row[column.dataKey]}
                </TableCell>
            ))}
        </React.Fragment>
    );
}

export default function HistoryPage() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Box sx={{ flex: 1, padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}> {/*ini jarak header dan tabel*/}
                <Paper sx={{ height: 'calc(100vh - 8rem)', width: '90%', overflow: 'hidden', marginBottom: '2rem' }}>
                    <TableVirtuoso
                        data={rows}
                        components={VirtuosoTableComponents}
                        fixedHeaderContent={fixedHeaderContent}
                        itemContent={rowContent}
                    />
                </Paper>
            </Box>
        </Box>
    );
}

