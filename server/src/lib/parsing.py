from xml.etree import ElementTree
from xml.etree.ElementTree import Element

from models.models import SizeStandard, GenLib


def parse_file(content: bytes, filename: str) -> tuple[list[SizeStandard], list[GenLib]]:
    size_standards: list[SizeStandard] = []
    gen_libs: list[GenLib] = []
    try:
        root = ElementTree.fromstring(content)
        raw_title: str = root.findtext('Title')  # type: ignore
        type_value = root.findtext('Type')
        if type_value == 'AllelicLadder':
            size_standard_node = root.find('./SizeStandard/Sizes')
            if size_standard_node is not None:
                sizes: list[float] = []
                concentrations: list[float] = []
                release_times: list[int] = []

                size_elements = size_standard_node.findall('double')
                for size_elem in size_elements:
                    sizes.append(float(size_elem.text))  # type: ignore
                    concentrations.append(float(size_elem.get('Concentration')))  # type: ignore
                    release_time_str: str = size_elem.get('ReleaseTime')  # type: ignore
                    time_parts = release_time_str.split(':')
                    release_times.append(int(time_parts[0]) * 3600 + int(time_parts[1]) * 60 + int(time_parts[2]))

                size_standards.append(SizeStandard(
                    title=raw_title,
                    filename=filename,
                    data=extract_filtered_int_values(root.findall('./Data/Point')),
                    sizes=sizes,
                    concentrations=concentrations,
                    release_times=release_times,
                ))
        elif type_value == 'Sample':
            gen_libs.append(GenLib(
                title='GenLib_' + raw_title,
                filename=filename,
                data=extract_filtered_int_values(root.findall('./Data/Point')),
            ))
    except Exception as ex:
        print(ex)
    return size_standards, gen_libs


def extract_filtered_int_values(point_nodes: list[Element]) -> list[int]:
    values: list[int] = []
    for point in point_nodes:
        data_node = point.find('Data')
        if data_node is not None:
            int_nodes = data_node.findall('int')
            for node in int_nodes:
                val = int(node.text)  # type: ignore
                if val != 1:
                    values.append(val)
    return values
