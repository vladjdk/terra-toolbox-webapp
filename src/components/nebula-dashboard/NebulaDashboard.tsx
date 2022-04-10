import { Container, Paper, Grid, MenuItem, Select } from '@mui/material';
import useNetwork from 'hooks/useNetwork';
import { useNebula, ClusterList, ClusterState, ClusterInfo } from 'hooks/useNebula';
import { useEffect, useState } from 'react';
import { useConnectedWallet, useLCDClient } from '@terra-money/wallet-provider';

export interface Cluster {
    cluster_info: ClusterInfo,
    cluster_addr: string,
}

export function NebulaDashboard() {
    const network = useNetwork();
    const wallet = useConnectedWallet();
    const lcd = useLCDClient();
    const { getClusterList, getClusterState, getClusterInfo, getTarget } = useNebula(network.contracts.nebulaFactory);

    const [clusterAddresses, setClusterAddresses] = useState<string[]>([]);
    const [clusters, setClusters] = useState<Cluster[]>();
    const [selectedCluster, setSelectedCluster] = useState<Cluster>();
    const [clusterState, setClusterState] = useState<ClusterState>();
    const [clusterInfo, setClusterInfo] = useState<ClusterInfo>();
    
    useEffect(() => {
        getAllClusters().then()
    }, [wallet, network])

    useEffect(() => {
        if(selectedCluster) {
            getStateForCluster(selectedCluster.cluster_addr).then()
        }
    }, [selectedCluster]) 

    const getAllClusters = async () => {
        getClusterList().then(async data => {
            const clusterAddresses: string[] = [];
            const clusterPromises: Promise<Cluster>[] = [];
            data.contract_infos.forEach((contract: [active: any, contract_addr: string]) => {
                if(contract[1]) {
                    clusterAddresses.push(contract[0]);
                    clusterPromises.push(getInfoForCluster(contract[0]));
                }
            });
            setClusterAddresses(clusterAddresses);
            Promise.all(clusterPromises).then(c => {
                setClusters(c);
                setSelectedCluster(c[0]);
            })
        })
    }

    const getInfoForCluster = async (clusterAddress: string): Promise<Cluster> => {
        return {
            cluster_info: await getClusterInfo(clusterAddress),
            cluster_addr: clusterAddress
        }
    }

    const getStateForCluster = async (clusterAddress: string) => {
        getClusterState(clusterAddress).then(data => {
            setClusterState(data);
        });
    }

    const onRefresh = () => {
        
    }

    const handleChange = (e: any) => {
        setSelectedCluster(clusters?.find(cluster => cluster.cluster_info.name == e.target.value) as Cluster);
    }

    return (
        <Container sx={{maxWidth: '1200px', padding: '10px'}}>
            <Select
                value={selectedCluster ? selectedCluster?.cluster_info.name : ""}
                onChange={handleChange}
            >
                {
                    clusters?.map(info => {
                        return (
                            <MenuItem key={info.cluster_info.name} value={info.cluster_info.name}>
                                {info.cluster_info.name}
                            </MenuItem>
                        );
                    })
                }
            </Select>
            <p>{selectedCluster?.cluster_addr}</p>
            <p>{selectedCluster?.cluster_info.name}</p>
            <p>{selectedCluster?.cluster_info.description}</p>
            <p>{clusterState?.target[0].amount}</p>
        </Container>
    );
  }
