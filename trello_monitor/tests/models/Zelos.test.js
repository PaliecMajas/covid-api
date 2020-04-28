const Zelos = require('../../models/Zelos');

const zelos = new Zelos();

describe('Zelos', () => {
    test('Name from short description', () => {
        expect(zelos.nameFromDescription('Short description')).toBe('Short description');
    });

    test('Name from long description', () => {
        const longDescription256 = 'queil2vee9quui2Tah3aiguehee7cei3iqueiheiFeYee9va8aiy9ohSujeo9Aa9kahCavoghaerii7queebooLoil9Niebe9liehuu8eib7ce0chohxi6osi4Rashau4ayee7eZe8eeghoith7eechaicaephoatekoh2moocheiCheu5ong7ohdiWohpequ2kohmee3pahwaJait8peesoechae9jiethai4ohquah1os3uep4jeiVuBeezur8';
        const nameFromLongdescription = 'queil2vee9quui2Tah3aiguehee7cei3iqueiheiFeYee9va8aiy9ohSujeo9Aa9kahCavoghaerii7queebooLoil9Niebe9liehuu8eib7ce0chohxi6osi4Rashau4ayee7eZe8eeghoith7eechaicaephoatekoh2moocheiCheu5ong7ohdiWohpequ2kohmee3pahwaJait8peesoechae9jiethai4ohquah1os3uep4jeiVuBee...'
        expect(zelos.nameFromDescription(longDescription256)).toBe(nameFromLongdescription);
    });

    test('Instruction from details', () => {
        const details = {
            phone: '_PHONE_',
            address: '_ADDRESS_',
            name: '_NAME_',
            neighborhood: '_NEIGHBORHOOD_'
        };
        expect(zelos.instructionsFromDetails(details))
            .toBe('Phone: _PHONE_\nAddress: _ADDRESS_\nName: _NAME_\nNeighborhood: _NEIGHBORHOOD_');
    });
});
