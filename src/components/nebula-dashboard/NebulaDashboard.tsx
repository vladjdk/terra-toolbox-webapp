import { Container, Paper, Grid, MenuItem, Select } from '@mui/material';
import useNetwork from 'hooks/useNetwork';
import { useNebula, ClusterList, ClusterState, ClusterInfo } from 'hooks/useNebula';
import { useEffect, useState } from 'react';
import { useConnectedWallet, useLCDClient } from '@terra-money/wallet-provider';

export function NebulaDashboard() {
    const network = useNetwork();
    const wallet = useConnectedWallet();
    const lcd = useLCDClient();
    const { getClusterList, getClusterState, getClusterInfo, getTarget } = useNebula(network.contracts.nebulaFactory);

    const [clusterAddresses, setClusterAddresses] = useState<string[]>([]);
    const [selectedCluster, setSelectedCluster] = useState<string>();
    const [clusterState, setClusterState] = useState<ClusterState>();
    const [clusterInfo, setClusterInfo] = useState<ClusterInfo>();
    
    useEffect(() => {
        getAllClusters().then()
    }, [wallet, network])

    useEffect(() => {
        if(selectedCluster) {
            getInfoForCluster(selectedCluster).then()
        }
    }, [selectedCluster]) 

    const getAllClusters = async () => {
        getClusterList().then(data => {
            const clusterAddresses: string[] = [];
            data.contract_infos.forEach((contract: [active: any, contract_addr: string]) => {
                if(contract) {
                    clusterAddresses.push(contract[0]);
                }
            });
            setClusterAddresses(clusterAddresses);
            setSelectedCluster(clusterAddresses[0])
        })
    }

    const getInfoForCluster = async (clusterAddress: string) => {
        getClusterState(clusterAddress).then(data => {
            setClusterState(data);
        });
        getClusterInfo(clusterAddress).then(data => {
            setClusterInfo(data);
        });
    }

    const onRefresh = () => {
        
    }

    const handleChange = (e: any) => {
        setSelectedCluster(e.target.value as string);
    }

    return (
        <Container sx={{maxWidth: '1200px', padding: '10px'}}>
            <Select
                value={selectedCluster}
                onChange={handleChange}
            >
                {
                    clusterAddresses?.map(address => {
                        return (
                            <MenuItem key={address} value={address}>
                                {address}
                            </MenuItem>
                        );
                    })
                }
            </Select>
            <p>{selectedCluster}</p>
            <p>{clusterInfo?.name}</p>
            <p>{clusterState?.active}</p>
        </Container>
    );
  }
